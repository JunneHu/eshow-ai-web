
import React, { useRef, useEffect, useLayoutEffect, ReactElement, memo } from 'react';
import { gsap } from 'gsap';

export interface PropsModel {
  // wrapperElement?: ReactElement;
  direction?: string;
  delay?: number;
  distance?: number;
  duration?: number;
  // isJumpOtherPage?: boolean; // 离开页面动画
  key: string;
  pathname: string; // 页面路由

  [key: string]: any;
}

const FadeInAnimation: React.FC<PropsModel> = ({
  children,
  // wrapperElement = 'div',
  direction = 'right',
  delay = 0,
  distance = 200,
  duration = 1,
  ...props
}) => {
  // const Component = wrapperElement;
  let compRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const isSamePath = props.location?.pathname === props.pathname;
    if (isSamePath) {
      const fadeDirection = getDirection();

      const animationDom = gsap.fromTo(
        compRef.current,
        {
          ...fadeDirection,
          opacity: 0,
          delay,
        },
        {
          x: 0,
          y: 0,
          duration,
          opacity: 1,
        },
      );
      return () => {
        animationDom.kill();
      };
    }
  }, [props.location]);

  const getDirection = (): { [key: string]: number } => {
    let fadeDirection;

    switch (direction) {
      case 'left':
        fadeDirection = { x: -distance };
        break;
      case 'right':
        fadeDirection = { x: distance };
        break;
      case 'up':
        fadeDirection = { y: distance };
        break;
      case 'down':
        fadeDirection = { y: -distance };
        break;
      default:
        fadeDirection = { x: 0 };
    }

    return fadeDirection;
  };

  // 离开页面的动画:导航
  useLayoutEffect(() => {
    if (props.isJumpOtherPage) {
      // console.log(
      //   '🚀 ~ file: FadeInAnimation.tsx ~ line 91 ~ useLayoutEffect ~ props.isJumpOtherPage',
      //   props.isJumpOtherPage,
      // );
    }
  }, [props.isJumpOtherPage]);

  return (
    // <Component ref={compRef} {...props}>
    //   {children}
    // </Component>

    <div ref={compRef} {...props} key={props.key}>
      {children}
    </div>
  );
};

export default memo(FadeInAnimation);
