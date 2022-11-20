import { useState } from "react";

export type Tab = {
  label: string;
  default?: boolean;
  view: React.ReactNode;
}

type TabGroupProps = {
  tabs: Tab[];
}

export const TabGroup: React.FC<TabGroupProps> = (props: TabGroupProps) => {

  const [selected, setSelected] = useState<Tab>(props.tabs.find(tab => tab.default) || props.tabs[0])
  const isSelected = (tab: Tab): boolean => { return tab === selected} 
  return (
    <div className="flex flex-col drop-shadow-2xl">
      <div className="flex flex-row pl-4">
        {props.tabs.map(tab =>
          <div key={tab.label} className="text-xl">
            { isSelected(tab) ? (
            <button 
              className="rounded-t-xl bg-green-600 mx-1 py-1 px-4 "
              onClick={() => setSelected(tab)}>
                { tab.label }
            </button>
            ) : (
            <button 
              className="rounded-t-xl bg-green-800 mx-1 py-1 px-4"
              onClick={() => setSelected(tab)}>
                { tab.label }
            </button>
            )}
          </div>
        )}
      </div>
      <div className="rounded-xl p-20 bg-green-600" >
        { selected.view }
      </div>
    </div>
  )
};