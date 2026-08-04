// Parses simple dice notation like "2d6+3", "1d20", "4d8-2", "d20+5"
function rollDice(expression) {
  const expr = (expression || '').replace(/\s+/g, '').toLowerCase();
  const match = expr.match(/^(\d*)d(\d+)([+-]\d+)?$/);
  if (!match) return null;
  const count = Math.min(parseInt(match[1] || '1', 10), 100);
  const sides = Math.min(parseInt(match[2], 10), 1000);
  const modifier = match[3] ? parseInt(match[3], 10) : 0;
  if (!count || !sides) return null;
  const rolls = [];
  for (let i = 0; i < count; i++) {
    rolls.push(1 + Math.floor(Math.random() * sides));
  }
  const subtotal = rolls.reduce((a, b) => a + b, 0);
  const total = subtotal + modifier;
  return { expression: `${count}d${sides}${modifier ? (modifier > 0 ? '+' + modifier : modifier) : ''}`, rolls, modifier, total };
}

module.exports = { rollDice };
