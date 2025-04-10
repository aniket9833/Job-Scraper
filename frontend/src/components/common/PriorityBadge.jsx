function PriorityBadge({ priority }) {
  let className = 'priority-badge';

  if (priority >= 8) {
    className += ' high';
  } else if (priority >= 5) {
    className += ' medium';
  } else {
    className += ' low';
  }

  return <span className={className}>{priority}</span>;
}

export default PriorityBadge;
