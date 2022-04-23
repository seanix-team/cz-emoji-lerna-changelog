function formatScope(scope) {
  return scope ? `(${scope})` : ''
}

function formatHead({ type, scope, subject }, config) {
  const prelude = config.conventional
    ? `${type.name}${formatScope(scope)}: ${type.emoji}`
    : `${type.emoji} ${formatScope(scope)}`

  return `${prelude} ${subject}`
}

function formatIssues(issues) {
  return issues ? 'Closes ' + (issues.match(/#\d+/g) || []).join(', closes ') : ''
}

export { formatScope, formatHead, formatIssues }
