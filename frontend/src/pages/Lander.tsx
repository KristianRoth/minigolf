import React from "react"
import { Tab, TabGroup } from "../components/Tab"
import EditorTab from "./EditorTab"
import Maps from "./Maps"
import RootPage from "./Root"


const Lander: React.FC = () => {
  const tabs: Tab[] = [
    {
      default: true,
      label: "JOIN",
      view: <RootPage />
    },
    {
      label: "EDITOR",
      view: <EditorTab />
    },
    {
      label: "CREATE",
      view: <h1>Testi content</h1>
    },
    {
      label: "MAPS",
      view: <Maps />
    }
  ]
  return (
    <>
      <TabGroup tabs = {tabs}/>
    </>
  )
}

export default Lander