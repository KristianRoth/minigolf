import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export type Tab = {
  label: string;
  default?: boolean;
  view: React.ReactNode;
};

type TabGroupProps = {
  tabs: Tab[];
};

export const TabGroup: React.FC<TabGroupProps> = ({ tabs }: TabGroupProps) => {
  const [selected, setSelected] = useState<Tab>(tabs.find((tab) => tab.default) || tabs[0]);
  const [params, setParams] = useSearchParams();

  const setTab = (idx: number) => {
    setParams(idx > 0 ? { tab: `${idx}` } : {}, { replace: true });
  };

  const tabIdx = parseInt(params.get('tab') || '');

  useEffect(() => {
    if (isNaN(tabIdx)) {
      setSelected(tabs.find((tab) => tab.default) || tabs[0]);
      return;
    }
    setSelected(tabs[tabIdx]);
  }, [tabIdx, tabs]);

  const isSelected = (tab: Tab): boolean => {
    return tab === selected;
  };
  return (
    <div className='flex flex-col drop-shadow-2xl'>
      <div className='flex flex-row pl-4'>
        {tabs.map((tab, idx) => (
          <div key={tab.label} className='text-xl'>
            {isSelected(tab) ? (
              <button className='rounded-t-xl bg-green-600 mx-1 py-1 px-4 ' onClick={() => setTab(idx)}>
                {tab.label}
              </button>
            ) : (
              <button className='rounded-t-xl bg-green-800 mx-1 py-1 px-4' onClick={() => setTab(idx)}>
                {tab.label}
              </button>
            )}
          </div>
        ))}
      </div>
      <div className='rounded-xl p-20 bg-green-600'>{selected.view}</div>
    </div>
  );
};
