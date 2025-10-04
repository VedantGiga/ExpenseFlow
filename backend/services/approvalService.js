import pool from '../database/db.js';

export const createApprovalWorkflow = async (expenseId, companyId, amount) => {
  // Find applicable approval rule
  const ruleResult = await pool.query(`
    SELECT * FROM approval_rules 
    WHERE company_id = $1 AND is_active = true 
    AND (min_amount IS NULL OR $2 >= min_amount)
    AND (max_amount IS NULL OR $2 <= max_amount)
    ORDER BY min_amount DESC LIMIT 1
  `, [companyId, amount]);

  if (ruleResult.rows.length === 0) {
    // No rule found, create simple manager approval
    const expense = await pool.query('SELECT user_id FROM expenses WHERE id = $1', [expenseId]);
    const employee = await pool.query('SELECT manager_id FROM users WHERE id = $1', [expense.rows[0].user_id]);
    
    if (employee.rows[0].manager_id) {
      await pool.query(
        'INSERT INTO expense_approvals (expense_id, approver_id, step_order) VALUES ($1, $2, 1)',
        [expenseId, employee.rows[0].manager_id]
      );
    }
    return;
  }

  const rule = ruleResult.rows[0];
  await pool.query('UPDATE expenses SET approval_rule_id = $1 WHERE id = $2', [rule.id, expenseId]);

  // Get approval steps
  const stepsResult = await pool.query(
    'SELECT * FROM approval_steps WHERE rule_id = $1 ORDER BY step_order',
    [rule.id]
  );

  // Create approval records
  for (const step of stepsResult.rows) {
    let approverId = step.approver_id;
    
    if (step.is_manager_step) {
      const expense = await pool.query('SELECT user_id FROM expenses WHERE id = $1', [expenseId]);
      const employee = await pool.query('SELECT manager_id FROM users WHERE id = $1', [expense.rows[0].user_id]);
      approverId = employee.rows[0].manager_id;
    }

    if (approverId) {
      await pool.query(
        'INSERT INTO expense_approvals (expense_id, approver_id, step_order) VALUES ($1, $2, $3)',
        [expenseId, approverId, step.step_order]
      );
    }
  }
};

export const processApproval = async (expenseId, approverId, status, comments) => {
  // Update approval record
  await pool.query(
    'UPDATE expense_approvals SET status = $1, comments = $2, approved_at = NOW() WHERE expense_id = $3 AND approver_id = $4',
    [status, comments, expenseId, approverId]
  );

  if (status === 'rejected') {
    await pool.query('UPDATE expenses SET status = $1 WHERE id = $2', ['rejected', expenseId]);
    return { status: 'rejected' };
  }

  // Check if expense should be approved
  const expense = await pool.query('SELECT * FROM expenses WHERE id = $1', [expenseId]);
  const rule = await pool.query('SELECT * FROM approval_rules WHERE id = $1', [expense.rows[0].approval_rule_id]);

  if (rule.rows.length === 0) {
    // Simple approval
    await pool.query('UPDATE expenses SET status = $1, approved_by = $2 WHERE id = $3', ['approved', approverId, expenseId]);
    return { status: 'approved' };
  }

  const approvalRule = rule.rows[0];
  
  // Check specific approver rule
  if (approvalRule.specific_approver_id === approverId) {
    await pool.query('UPDATE expenses SET status = $1, approved_by = $2 WHERE id = $3', ['approved', approverId, expenseId]);
    return { status: 'approved' };
  }

  // Check percentage rule
  if (approvalRule.percentage_threshold) {
    const totalApprovers = await pool.query('SELECT COUNT(*) FROM expense_approvals WHERE expense_id = $1', [expenseId]);
    const approvedCount = await pool.query('SELECT COUNT(*) FROM expense_approvals WHERE expense_id = $1 AND status = $2', [expenseId, 'approved']);
    
    const approvalPercentage = (approvedCount.rows[0].count / totalApprovers.rows[0].count) * 100;
    
    if (approvalPercentage >= approvalRule.percentage_threshold) {
      await pool.query('UPDATE expenses SET status = $1, approved_by = $2 WHERE id = $3', ['approved', approverId, expenseId]);
      return { status: 'approved' };
    }
  }

  // Move to next step
  const currentStep = expense.rows[0].current_step;
  const nextStep = currentStep + 1;
  
  const nextApprover = await pool.query(
    'SELECT * FROM expense_approvals WHERE expense_id = $1 AND step_order = $2',
    [expenseId, nextStep]
  );

  if (nextApprover.rows.length > 0) {
    await pool.query('UPDATE expenses SET current_step = $1 WHERE id = $2', [nextStep, expenseId]);
    return { status: 'pending', nextStep };
  }

  // No more steps, approve
  await pool.query('UPDATE expenses SET status = $1, approved_by = $2 WHERE id = $3', ['approved', approverId, expenseId]);
  return { status: 'approved' };
};