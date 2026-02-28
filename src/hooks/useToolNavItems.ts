import React, { useEffect, useMemo, useState } from 'react';
import {
  FireOutlined,
  ClockCircleOutlined,
  EditOutlined,
  PictureOutlined,
  VideoCameraOutlined,
  FileTextOutlined,
  RobotOutlined,
  MessageOutlined,
  CodeOutlined,
  CloudOutlined,
  AppstoreOutlined,
  SoundOutlined,
  SearchOutlined,
  ReadOutlined,
  DatabaseOutlined,
  BarChartOutlined,
  AuditOutlined,
  BulbOutlined,
} from '@ant-design/icons';
import { getCategories } from '@/api/tools';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  writing: React.createElement(EditOutlined),
  image: React.createElement(PictureOutlined),
  video: React.createElement(VideoCameraOutlined),
  office: React.createElement(FileTextOutlined),
  agent: React.createElement(RobotOutlined),
  chat: React.createElement(MessageOutlined),
  coding: React.createElement(CodeOutlined),
  platform: React.createElement(CloudOutlined),
  design: React.createElement(AppstoreOutlined),
  audio: React.createElement(SoundOutlined),
  search: React.createElement(SearchOutlined),
  learn: React.createElement(ReadOutlined),
  models: React.createElement(DatabaseOutlined),
  eval: React.createElement(BarChartOutlined),
  'content-detect': React.createElement(AuditOutlined),
  prompt: React.createElement(BulbOutlined),
};

export interface NavItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  path?: string;
}

export interface CategoryItem {
  id: number;
  categoryKey: string;
  title: string;
}

/** 获取分类菜单（热门、最新、各分类），供首页和分类详情页共用 */
export function useToolNavItems() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res: any = await getCategories();
        const list = res.data || [];
        setCategories(
          list.map((c: any) => ({
            id: c.id,
            categoryKey: c.categoryKey,
            title: c.title,
          }))
        );
      } catch {
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const navItems: NavItem[] = useMemo(() => {
    const items: NavItem[] = [
      { key: 'hot', label: '热门工具', icon: React.createElement(FireOutlined) },
      { key: 'latest', label: '最新收录', icon: React.createElement(ClockCircleOutlined) },
    ];
    categories.forEach((c) => {
      items.push({
        key: c.categoryKey,
        label: c.title,
        icon: CATEGORY_ICONS[c.categoryKey] ?? React.createElement(AppstoreOutlined),
      });
    });
    return items;
  }, [categories]);

  return { navItems, categories, loading };
}
