window.mhCopyText = async function (text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const previous = document.activeElement;
  const field = document.createElement("textarea");
  field.value = text;
  field.readOnly = true;
  field.style.cssText = "position:fixed;top:0;left:0;opacity:0";
  (document.querySelector("dialog[open]") || document.body).appendChild(field);
  try {
    field.select();
    if (!document.execCommand("copy")) throw new Error("Clipboard copy was refused.");
  } finally {
    field.remove();
    if (previous && previous.isConnected) previous.focus({ preventScroll: true });
  }
};
