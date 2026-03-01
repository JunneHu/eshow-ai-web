import React, { useEffect, useMemo, useState } from 'react';
import { Button, Input, Spin, Typography, message } from 'antd';

const { Title, Text } = Typography;
const { TextArea } = Input;

type AnyObj = Record<string, any>;

type GetCommentsFn = (params: { page: number; pageSize: number }) => Promise<any>;

type CreateCommentFn = (data: { parentId: number | null; content: string; nickname: string; email?: string; website?: string }) => Promise<any>;

export type CommentSectionProps = {
  title?: string;
  bizId: number;
  storageKey: string;
  getComments: GetCommentsFn;
  createComment: CreateCommentFn;
  trackSubmit?: (payload: { isReply: boolean }) => void;
  onSubmitted?: (payload: { isReply: boolean }) => void;
};

function avatarText(nickname: any): string {
  const s = nickname ? String(nickname).trim() : '';
  if (!s) return '访客';
  const first = s.slice(0, 1);
  if (/^[a-zA-Z]$/.test(first)) return s.slice(0, 2).toUpperCase();
  return first;
}

function loadCommentUser(storageKey: string) {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return {
      nickname: parsed.nickname ? String(parsed.nickname) : '',
      email: parsed.email ? String(parsed.email) : '',
      website: parsed.website ? String(parsed.website) : '',
    };
  } catch {
    return null;
  }
}

function saveCommentUser(storageKey: string, user: { nickname: string; email: string; website: string }) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(user || {}));
  } catch {}
}

const CommentSection: React.FC<CommentSectionProps> = (props) => {
  const { title = '评论', bizId, storageKey, getComments, createComment, trackSubmit } = props;

  const [comments, setComments] = useState<any[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsLoadingMore, setCommentsLoadingMore] = useState(false);
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  const [commentContent, setCommentContent] = useState('');
  const [commentNickname, setCommentNickname] = useState('');
  const [commentEmail, setCommentEmail] = useState('');
  const [commentWebsite, setCommentWebsite] = useState('');

  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [replyShowIdentity, setReplyShowIdentity] = useState(false);

  const [commentPage, setCommentPage] = useState(1);
  const [commentPageSize] = useState(10);
  const [commentTotal, setCommentTotal] = useState(0);

  useEffect(() => {
    const saved = loadCommentUser(storageKey);
    if (!saved) return;
    if (saved.nickname) setCommentNickname(saved.nickname);
    if (saved.email) setCommentEmail(saved.email);
    if (saved.website) setCommentWebsite(saved.website);
  }, [storageKey]);

  const hasMoreComments = useMemo(() => comments.length < commentTotal, [comments.length, commentTotal]);

  const fetchCommentsPage = async (page: number, append: boolean) => {
    if (append) setCommentsLoadingMore(true);
    else setCommentsLoading(true);
    try {
      const res: any = await getComments({ page, pageSize: commentPageSize });
      const data = res && res.data;
      const list = (data && data.list) || [];
      const total = (data && data.total) || 0;
      setCommentTotal(total);
      setCommentPage(page);
      setComments((prev) => (append ? [...prev, ...list] : list));
    } catch {
      if (!append) {
        setComments([]);
        setCommentTotal(0);
        setCommentPage(1);
      }
    } finally {
      if (append) setCommentsLoadingMore(false);
      else setCommentsLoading(false);
    }
  };

  useEffect(() => {
    if (!bizId) return;
    fetchCommentsPage(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bizId]);

  const handleSubmitComment = async (parentId?: number | null) => {
    const content = (parentId ? replyContent : commentContent).trim();
    const nickname = commentNickname.trim();
    const email = commentEmail.trim();
    const website = commentWebsite.trim();

    if (!content) {
      message.warning('请输入评论内容');
      return;
    }
    if (!nickname) {
      message.warning('请输入昵称');
      return;
    }

    setCommentSubmitting(true);
    try {
      await createComment({
        parentId: parentId || null,
        content,
        nickname,
        email,
        website,
      });

      message.success('发表成功');
      if (trackSubmit) trackSubmit({ isReply: !!parentId });
      if (props.onSubmitted) props.onSubmitted({ isReply: !!parentId });

      saveCommentUser(storageKey, { nickname, email, website });

      if (parentId) {
        setReplyContent('');
        setReplyingTo(null);
        setReplyShowIdentity(false);
      } else {
        setCommentContent('');
      }

      fetchCommentsPage(1, false);
    } catch {
    } finally {
      setCommentSubmitting(false);
    }
  };

  const formatTime = (v: any) => {
    if (!v) return '';
    return String(v).replace('T', ' ').slice(0, 19);
  };

  const renderCommentItem = (item: AnyObj, level: number = 0) => {
    const website = item.website ? String(item.website) : '';
    return (
      <div key={item.id} className="ai-comment-item" style={{ marginLeft: level ? 50 : 0 }}>
        <div className="ai-comment-main">
          <div className="ai-comment-avatar">{avatarText(item.nickname)}</div>
          <div className="ai-comment-body">
            <div className="ai-comment-meta">
              <div className="ai-comment-author">
                <span className="ai-comment-nickname">{String(item.nickname || '游客')}</span>
                {website ? (
                  <a className="ai-comment-website" href={website} target="_blank" rel="noreferrer">
                    {website}
                  </a>
                ) : null}
              </div>
              <div className="ai-comment-time">{formatTime(item.createdAt)}</div>
            </div>
            <div className="ai-comment-content">{String(item.content || '')}</div>
            <div className="ai-comment-actions">
              <Button type="link" size="small" onClick={() => setReplyingTo(Number(item.id))} style={{ padding: 0 }}>
                回复
              </Button>
            </div>

            {replyingTo === Number(item.id) ? (
              <div className="ai-comment-reply">
                <TextArea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="输入评论内容..."
                  rows={4}
                />

                {!commentNickname || replyShowIdentity ? (
                  <div className="ai-comment-form-row">
                    <Input value={commentNickname} onChange={(e) => setCommentNickname(e.target.value)} placeholder="昵称" />
                    <Input value={commentEmail} onChange={(e) => setCommentEmail(e.target.value)} placeholder="邮箱" />
                    <Input value={commentWebsite} onChange={(e) => setCommentWebsite(e.target.value)} placeholder="网址" />
                  </div>
                ) : (
                  <div className="ai-comment-identity">
                    <Text type="secondary">将使用昵称：{commentNickname}</Text>
                    <Button type="link" size="small" onClick={() => setReplyShowIdentity(true)} style={{ padding: 0 }}>
                      修改信息
                    </Button>
                  </div>
                )}

                <div className="ai-comment-form-actions">
                  <Button
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyContent('');
                      setReplyShowIdentity(false);
                    }}
                  >
                    再想想
                  </Button>
                  <Button type="primary" loading={commentSubmitting} onClick={() => handleSubmitComment(Number(item.id))}>
                    发表评论
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {Array.isArray(item.replies) && item.replies.length > 0 ? (
          <div className="ai-comment-replies">{item.replies.map((r: any) => renderCommentItem(r, level + 1))}</div>
        ) : null}
      </div>
    );
  };

  return (
    <section className="ai-tools-section ai-comments-section">
      <div className="ai-tools-section-header">
        <Title level={4} className="ai-tools-section-title">
          {title}
        </Title>
      </div>

      <div className="ai-comment-form">
        <TextArea
          value={commentContent}
          onChange={(e) => setCommentContent(e.target.value)}
          placeholder="输入评论内容..."
          rows={4}
        />
        <div className="ai-comment-form-row">
          <Input value={commentNickname} onChange={(e) => setCommentNickname(e.target.value)} placeholder="昵称" />
          <Input value={commentEmail} onChange={(e) => setCommentEmail(e.target.value)} placeholder="邮箱" />
          <Input value={commentWebsite} onChange={(e) => setCommentWebsite(e.target.value)} placeholder="网址" />
        </div>
        <div className="ai-comment-form-actions">
          <Button type="primary" loading={commentSubmitting} onClick={() => handleSubmitComment(null)}>
            发表评论
          </Button>
        </div>
      </div>

      <div className="ai-comment-list">
        {commentsLoading ? (
          <div className="ai-tools-loading" style={{ height: 120 }}>
            <Spin />
          </div>
        ) : comments.length === 0 ? (
          <Text type="secondary">暂无评论，快来抢沙发吧。</Text>
        ) : (
          comments.map((c: any) => renderCommentItem(c, 0))
        )}

        {!commentsLoading && comments.length > 0 ? (
          <div className="ai-comment-loadmore">
            {hasMoreComments ? (
              <Button
                type="link"
                className="ai-comment-loadmore-link"
                onClick={() => fetchCommentsPage(commentPage + 1, true)}
                disabled={commentsLoadingMore}
              >
                <span className="ai-comment-loadmore-text">展开</span>
                {commentsLoadingMore ? <Spin size="small" /> : null}
              </Button>
            ) : (
              <Text type="secondary">没有更多了</Text>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default CommentSection;
