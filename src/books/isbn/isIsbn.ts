export function isIsbn(code: string): boolean {
  const withoutHyphens = removeHyphens(code);
  return isValidISBN10(withoutHyphens) || isValidISBN13(withoutHyphens);
}

function isValidISBN13(code: string) {
  if (!code.startsWith("978") && !code.startsWith("979")) {
    return false;
  }
  const checkDigitValid = isIsbn13CheckDigitValid(code);
  return checkDigitValid;
}

function isIsbn13CheckDigitValid(code: string): boolean {
  const digits = code.split("").map((d) => Number.parseInt(d));
  const sum = digits.reduce((total, digit, index) => {
    const weight = (index + 1) % 2 === 0 ? 3 : 1;
    return total + digit * weight;
  }, 0);
  return sum % 10 === 0;
}

function isValidISBN10(code: string): boolean {
  if (code.length !== 10) return false;
  const digits = code.split("").map((d) => {
    if (d === "X") {
      // Special case in ISBN 10
      return 10;
    }
    return Number.parseInt(d);
  });
  const sum = digits.reduce(
    (total, digit, index) => total + digit * (10 - index),
    0
  );
  return sum % 11 === 0;
}

export function removeHyphens(code: string): string {
  return code.replaceAll("-", "");
}
