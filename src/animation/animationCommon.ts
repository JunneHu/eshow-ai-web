import { gsap } from 'gsap';

// 点击按钮晃动
export const clickBtnAnimation = async (element: gsap.TweenTarget) => {
  const animation = await gsap.fromTo(
    element,
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
    }
  );
  animation.kill();
};

// 标题右侧滑入
export const titleAnimation = async (
  element: gsap.TweenTarget,
  params?: { x?: number; duration?: number; delay?: number }
) => {
  const animation = await gsap.from(element, {
    x: params?.x ?? 100,
    duration: params?.duration ?? 0.5,
    delay: params?.delay ?? 0,
    yoyo: true,
  });
  animation.kill();
};

// 淡入出现
export const cardAnimation = async (
  element: gsap.TweenTarget,
  params?: { x?: number; duration?: number; delay?: number }
) => {
  const animation = await gsap.fromTo(
    element,
    {
      opacity: 0,
      delay: params?.delay ?? 0,
    },
    {
      opacity: 1,
      duration: params?.duration ?? 2,
      // stagger: 0.2,
    }
  );
  animation.kill();
};

// const animationTitle = gsap.to(titleRef?.current, { duration: 1, rotation: '360', ease: 'elastic', yoyo: true });
// const animationTitle = gsap.to(titleRef?.current, { duration: 2.5, ease: 'slow(0.7, 0.7, false)', y: 0 });

// const animationTitle = gsap.fromTo(
//   titleRef?.current,
//   {
//     opacity: 0,
//   },
//   {
//     opacity: 1,
//     duration: 2,
//     stagger: 0.2,
//   },
// );

// const animationCard = gsap.to(gsapSelector('.my-client-detail-view__card'), {
//   opacity: 0,
// });
