export default function (command, event, data = null) {
  const { proxy } = useScriptMetaPixel()
  proxy.fbq(command, event, data)
}
