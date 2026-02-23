const OPERATORS = new Set(['+', '-', '*', '/', 'u-']);
const PRECEDENCE: Record<string, number> = {
  '+': 1,
  '-': 1,
  '*': 2,
  '/': 2,
  'u-': 3,
};
const RIGHT_ASSOCIATIVE = new Set(['u-']);

function isNumberToken(token: string): boolean {
  return /^\d+(?:\.\d+)?$/.test(token);
}

function isIdentifierToken(token: string): boolean {
  return /^[A-Za-z_]\w*$/.test(token);
}

function tokenize(formula: string): string[] {
  const normalized = formula.replace(/\s+/g, '');
  if (!normalized) {
    throw new Error('Formula cannot be empty');
  }

  const tokens: string[] = [];
  let cursor = 0;

  while (cursor < normalized.length) {
    const slice = normalized.slice(cursor);
    const match = slice.match(/^(\d+(?:\.\d+)?|[A-Za-z_]\w*|[()+\-*/])/);

    if (!match) {
      throw new Error(`Unexpected token near: ${slice}`);
    }

    tokens.push(match[1]);
    cursor += match[1].length;
  }

  return tokens;
}

function toRpn(tokens: string[]): string[] {
  const output: string[] = [];
  const operators: string[] = [];

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    const previous = index > 0 ? tokens[index - 1] : null;

    if (isNumberToken(token) || isIdentifierToken(token)) {
      output.push(token);
      continue;
    }

    if (token === '(') {
      operators.push(token);
      continue;
    }

    if (token === ')') {
      while (operators.length > 0 && operators[operators.length - 1] !== '(') {
        output.push(operators.pop() as string);
      }

      if (operators.pop() !== '(') {
        throw new Error('Mismatched parentheses in formula');
      }
      continue;
    }

    if (token === '+' || token === '-' || token === '*' || token === '/') {
      const isUnaryMinus =
        token === '-' &&
        (previous === null || previous === '(' || OPERATORS.has(previous));
      const operator = isUnaryMinus ? 'u-' : token;

      while (operators.length > 0) {
        const top = operators[operators.length - 1];
        if (!OPERATORS.has(top)) {
          break;
        }

        const lowerPrecedence = PRECEDENCE[top] > PRECEDENCE[operator];
        const samePrecedenceLeftAssoc =
          PRECEDENCE[top] === PRECEDENCE[operator] &&
          !RIGHT_ASSOCIATIVE.has(operator);

        if (!lowerPrecedence && !samePrecedenceLeftAssoc) {
          break;
        }

        output.push(operators.pop() as string);
      }

      operators.push(operator);
      continue;
    }

    throw new Error(`Unsupported token: ${token}`);
  }

  while (operators.length > 0) {
    const operator = operators.pop() as string;
    if (operator === '(' || operator === ')') {
      throw new Error('Mismatched parentheses in formula');
    }
    output.push(operator);
  }

  return output;
}

export function evaluateFormula(
  formula: string,
  parameters: Record<string, number>,
): number {
  const tokens = tokenize(formula);
  const rpn = toRpn(tokens);
  const stack: number[] = [];

  for (const token of rpn) {
    if (isNumberToken(token)) {
      stack.push(Number(token));
      continue;
    }

    if (isIdentifierToken(token)) {
      const value = parameters[token];
      if (typeof value !== 'number' || Number.isNaN(value)) {
        throw new Error(`Unknown parameter: ${token}`);
      }
      stack.push(value);
      continue;
    }

    if (token === 'u-') {
      const value = stack.pop();
      if (typeof value !== 'number') {
        throw new Error('Invalid unary operation in formula');
      }
      stack.push(-value);
      continue;
    }

    const right = stack.pop();
    const left = stack.pop();

    if (typeof left !== 'number' || typeof right !== 'number') {
      throw new Error('Invalid binary operation in formula');
    }

    if (token === '+') {
      stack.push(left + right);
      continue;
    }

    if (token === '-') {
      stack.push(left - right);
      continue;
    }

    if (token === '*') {
      stack.push(left * right);
      continue;
    }

    if (token === '/') {
      if (right === 0) {
        throw new Error('Division by zero');
      }
      stack.push(left / right);
      continue;
    }

    throw new Error(`Unsupported operator: ${token}`);
  }

  if (stack.length !== 1) {
    throw new Error('Invalid formula expression');
  }

  const result = stack[0];
  if (!Number.isFinite(result)) {
    throw new Error('Formula evaluated to a non-finite value');
  }

  return result;
}
