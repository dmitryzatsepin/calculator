import { useState, useCallback, useRef } from 'react';
import { FloatingIndicator, UnstyledButton } from '@mantine/core';
import classes from '../styles/DisplayDataInput.module.scss';
import DisplayParameters from './DisplayParameters';

const data = ['Кабинетный экран', 'Бегущая строка'];

export function DisplayDataInput() {
  const [rootRef, setRootRef] = useState<HTMLDivElement | null>(null);
  const controlsRefs = useRef<Record<number, HTMLButtonElement | null>>({});
  const [active, setActive] = useState(0);

  const setControlRef = useCallback((index: number) => (node: HTMLButtonElement | null) => {
    controlsRefs.current[index] = node;
  }, []);

  console.log("Rendering DisplayDataInput, active:", active);

  const controls = data.map((item, index) => (
    <UnstyledButton
      key={item}
      className={classes.control}
      ref={setControlRef(index)}
      onClick={() => setActive(index)}
      mod={{ active: active === index }}
    >
      <div className={classes.controlInner}>
        <span className={classes.controlLabel}>{item}</span>
      </div>
    </UnstyledButton>
  ));

  const renderSelectedComponent = () => {
    if (active === 0) {
      return <DisplayParameters />;
    } else if (active === 1) {
      return <div>Компонент для бегущей строки в разработке...</div>;
    }
    return null;
  };

  return (
    <div>
      <div className={classes.root} ref={setRootRef}>
        {controls}

        <FloatingIndicator
          target={controlsRefs.current[active]}
          parent={rootRef}
          className={classes.indicator}
        />
      </div>
      
      <div className={classes.contentContainer}>
        {renderSelectedComponent()}
      </div>
    </div>
  );
}

export default DisplayDataInput;