/*
 * BusinessAnalyticsSDK：面向运营/业务的埋点封装
 * - 统一 appId / 用户 / 会话等公共属性
 * - 约定好的业务事件：商品、转化链路、热区、AB 实验等
 * - 底层复用轻量埋点工具 tracking.ts（批量上报 /api/track/report）
 */

import { track } from './tracking';

export type EnvType = 'dev' | 'test' | 'prod';

export interface InitOptions {
  appId: string;
  env?: EnvType;
  debug?: boolean;
}

export interface ProductViewProps {
  productId: string;
  price?: number;
  category?: string;
  fromSlot?: string; // 资源位 / 槽位，如 home-banner-1
  fromPage?: string;
}

export interface AddToCartProps {
  productId: string;
  price: number;
  quantity: number;
  from?: string; // 入口/来源，例如 列表页/推荐位
}

export interface OrderSubmitProps {
  orderId: string;
  amount: number;
  skuCount: number;
  channel?: string; // 渠道，例如 douyin_ad / wechat_mp
}

export interface OrderPayProps {
  orderId: string;
  amount: number;
  payMethod?: string;
}

export interface HotlinkViewProps {
  slotId: string; // 资源位ID
  linkId: string; // 链接/素材ID（实际应该是完整 URL）
  linkText?: string; // 链接文本（可选）
  page: string; // 所在页面
  position?: string; // 位置信息（可选）
}

export interface HotlinkClickProps {
  slotId: string; // 资源位ID
  linkId: string; // 链接/素材ID（实际应该是完整 URL）
  linkText?: string; // 链接文本（可选）
  page: string; // 所在页面
  position?: string; // 位置信息（可选）
}

export interface ExperimentExposureProps {
  expId: string;
  variantId: string;
}

export interface ExperimentConversionProps extends ExperimentExposureProps {
  metric: string; // eg. 'order', 'add_to_cart'
}

interface CommonContext {
  app_id: string;
  env?: EnvType;
  user_id?: string | null;
  distinct_id?: string | null;
  session_id?: string | null;
  page_url: string;
  page_title: string;
  referrer: string;
}

class BusinessTracker {
  private appId: string | null = null;
  private env: EnvType = 'dev';
  private debug = false;

  private userId: string | null = null;
  private distinctId: string | null = null;
  private sessionId: string | null = null;

  public init(options: InitOptions) {
    this.appId = options.appId;
    this.env = options.env || this.env;
    this.debug = !!options.debug;

    // 简单的 session / distinctId 管理（可后续加强）
    if (!this.sessionId) {
      this.sessionId = this.generateId('sess');
    }
    if (!this.distinctId) {
      this.distinctId = this.loadOrCreateDistinctId();
    }
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.log('[BusinessTracker] init', {
        appId: this.appId,
        env: this.env,
        distinctId: this.distinctId,
      });
    }
  }

  public identify(userId: string) {
    this.userId = userId;
    if (!this.distinctId) {
      this.distinctId = userId;
    }
  }

  public resetIdentity() {
    this.userId = null;
    this.sessionId = this.generateId('sess');
  }

  /**
   * 通用 track，自动补充上下文
   */
  public track(event: string, props?: Record<string, any>) {
    if (!this.appId) {
      // 未初始化时直接忽略，避免打断业务
      return;
    }
    const context = this.buildContext();
    const payload = {
      ...context,
      ...(props || {}),
    };
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.log('[BusinessTracker] track', event, payload);
    }
    track(event, payload);
  }

  /**
   * 页面访问埋点：可附加 pageType / 业务ID 等
   */
  public pageView(extra?: { pageType?: string; productId?: string; from?: string }) {
    const props: Record<string, any> = {};
    if (extra?.pageType) props.page_type = extra.pageType;
    if (extra?.productId) props.product_id = extra.productId;
    if (extra?.from) props.from = extra.from;
    this.track('page_view', props);
  }

  public trackProductView(props: ProductViewProps) {
    this.track('product_view', {
      product_id: props.productId,
      price: props.price,
      category: props.category,
      from_slot: props.fromSlot,
      from_page: props.fromPage,
    });
  }

  public trackAddToCart(props: AddToCartProps) {
    this.track('add_to_cart', {
      product_id: props.productId,
      price: props.price,
      quantity: props.quantity,
      from: props.from,
    });
  }

  public   trackOrderSubmit(props: OrderSubmitProps) {
    // 后端使用 event_name: 'product_order'，字段需要 source 和 amount
    this.track('product_order', {
      order_id: props.orderId,
      amount: props.amount,
      sku_count: props.skuCount,
      source: props.channel, // 后端期望用 source 字段
    });
  }

  public trackOrderPay(props: OrderPayProps) {
    this.track('order_pay', {
      order_id: props.orderId,
      amount: props.amount,
      pay_method: props.payMethod,
    });
  }

  public   trackHotlinkView(props: HotlinkViewProps) {
    // 资源位曝光埋点（后端可能也需要 link_click 相关字段）
    this.track('hotlink_view', {
      slot_id: props.slotId,
      link_id: props.linkId,
      link_url: props.linkId,
      link_text: props.linkText || props.slotId,
      position: props.position || props.page,
      page: props.page,
    });
  }

  public trackHotlinkClick(props: HotlinkClickProps) {
    // 后端使用 event_name: 'link_click'，字段需要 link_url, link_text, position
    this.track('link_click', {
      link_url: props.linkId, // 实际应该是完整 URL，这里先用 linkId
      link_text: props.linkText || props.slotId, // 可以用 slotId 作为文本标识
      position: props.position || props.page, // 位置信息
      slot_id: props.slotId, // 保留原字段以便扩展
      link_id: props.linkId,
    });
  }

  public trackExperimentExposure(props: ExperimentExposureProps) {
    this.track('experiment_exposure', {
      exp_id: props.expId,
      variant_id: props.variantId,
    });
  }

  public trackExperimentConversion(props: ExperimentConversionProps) {
    this.track('experiment_conversion', {
      exp_id: props.expId,
      variant_id: props.variantId,
      metric: props.metric,
    });
  }

  // ================== 内部工具 ==================

  private buildContext(): CommonContext {
    const win: any = typeof window !== 'undefined' ? window : {};
    const location = win.location || { href: '', pathname: '' };
    const documentObj = typeof document !== 'undefined' ? document : ({} as any);

    return {
      app_id: this.appId || 'default',
      env: this.env,
      user_id: this.userId,
      distinct_id: this.distinctId,
      session_id: this.sessionId,
      page_url: location.href || '',
      page_title: documentObj.title || '',
      referrer: documentObj.referrer || '',
    };
  }

  private generateId(prefix: string) {
    return `${prefix}_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
  }

  private loadOrCreateDistinctId() {
    try {
      const key = 'ba_distinct_id';
      const stored = window.localStorage.getItem(key);
      if (stored) return stored;
      const id = this.generateId('u');
      window.localStorage.setItem(key, id);
      return id;
    } catch {
      return this.generateId('u');
    }
  }
}

export const businessTracker = new BusinessTracker();

export default businessTracker;


