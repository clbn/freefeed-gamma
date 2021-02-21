export function insertText(input, insertion) {
  const textBefore = input.value.slice(0, input.selectionStart);
  const textAfter = input.value.slice(input.selectionEnd);
  const spaceBefore = textBefore.length && !textBefore.match(/\s$/) ? ' ' : '';
  const spaceAfter = textAfter.length && !textAfter.match(/^\s/) ? ' ' : '';

  const partsBeforeCursor = `${textBefore}${spaceBefore}${insertion}${spaceAfter}`;

  input.value = `${partsBeforeCursor}${textAfter}`;
  input.focus();

  const cursorPosition = partsBeforeCursor.length;
  input.setSelectionRange(cursorPosition, cursorPosition);
}
