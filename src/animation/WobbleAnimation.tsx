

import React, { useRef, useEffect, useLayoutEffect, ReactElement, memo } from 'react';
import { gsap } from 'gsap';
import './index.less';
import { hasButtonsAuth } from '@/utils/util';

export interface PropsModel {
  operateMethod?: () => void;
  authInfo?: {
    enCode: string;
  };
  [key: string]: any;
}
// hover事件
const WobbleAnimation: React.FC<PropsModel> = ({ children, ...props }) => {
  let compRef = useRef<HTMLDivElement>(null);

  const clickComponent = async () => {
    // animationMethod();
    props?.operateMethod?.();
  };

  const animationMethod = async () => {
    const animation = await gsap.fromTo(
      compRef.current,
      {
        scale: 0.3,
        opacity: 0.3,
        duration: 0.5,
      },
      {
        scale: 1,
        opacity: 1,
        stagger: 0.2,
        ease: 'elastic',
        force3D: true,
        duration: 0.5,
      },
    );
    animation.kill();
  };

  const compDiv = (
    <div ref={compRef} {...props} className="wobble-animation-cont" onClick={clickComponent}>
      {children}
    </div>
  );

  return props.authInfo ? (hasButtonsAuth(props?.authInfo.enCode) ? compDiv : null) : compDiv;
};

export default memo(WobbleAnimation);
