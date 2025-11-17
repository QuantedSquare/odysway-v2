export default function (text) {
  return text.replace(/\*\*(.*?)\*\*/g, '<span class="font-weight-bold">$1</span>')
}
