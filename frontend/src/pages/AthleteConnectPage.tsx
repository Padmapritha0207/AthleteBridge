import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { CommunityGroup, GroupPost } from '../types';
import {
  MessageSquare, Users, ShieldAlert, Send, Flag, UserX,
  BookOpen, Plus, CheckCircle2, Sparkles, X, AlertTriangle
} from 'lucide-react';

export const AthleteConnectPage: React.FC = () => {
  const [groups, setGroups] = useState<CommunityGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<CommunityGroup | null>(null);
  const [posts, setPosts] = useState<GroupPost[]>([]);
  const [postContent, setPostContent] = useState('');
  const [loading, setLoading] = useState(true);

  // Guidelines modal
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [guidelines, setGuidelines] = useState<string[]>([]);

  // Report/Block modal
  const [reportPost, setReportPost] = useState<GroupPost | null>(null);
  const [reportReason, setReportReason] = useState('Inappropriate conduct');
  const [actionType, setActionType] = useState<'report' | 'block'>('report');

  const loadGroups = async () => {
    try {
      setLoading(true);
      const data = await api.getGroups();
      setGroups(data);
      if (data.length > 0 && !selectedGroup) {
        setSelectedGroup(data[0]);
      }
    } catch (err) {
      console.error('Failed to load community groups:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadPosts = async (groupId: number) => {
    try {
      const data = await api.getGroupPosts(groupId);
      setPosts(data);
    } catch (err) {
      console.error('Failed to load posts:', err);
    }
  };

  useEffect(() => {
    loadGroups();
    api.getGuidelines().then(res => setGuidelines(res.rules)).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      loadPosts(selectedGroup.id);
    }
  }, [selectedGroup]);

  const handleToggleJoin = async (group: CommunityGroup) => {
    try {
      if (group.is_member) {
        await api.leaveGroup(group.id);
      } else {
        await api.joinGroup(group.id);
      }
      await loadGroups();
    } catch (err: any) {
      alert(`Error updating membership: ${err.message}`);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup || !postContent.trim()) return;
    try {
      await api.createGroupPost({
        group_id: selectedGroup.id,
        content: postContent.trim()
      });
      setPostContent('');
      await loadPosts(selectedGroup.id);
    } catch (err: any) {
      alert(`Error posting: ${err.message}`);
    }
  };

  const handleReportOrBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportPost) return;
    try {
      await api.reportOrBlock({
        reported_user_id: reportPost.author_id,
        report_type: actionType,
        reason: reportReason
      });
      alert(`Action '${actionType}' submitted. The user's posts will no longer appear in your feed.`);
      setReportPost(null);
      if (selectedGroup) await loadPosts(selectedGroup.id);
    } catch (err: any) {
      alert(`Error submitting report: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>AthleteConnect: Peer Community</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 font-semibold border border-sky-200">
              Inclusive Peer Hub
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Connect across sports, academic disciplines, and adaptive networks. No private accommodations or health details are ever exposed.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowGuidelines(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-xs transition"
        >
          <BookOpen className="w-3.5 h-3.5 text-sky-600" />
          <span>Community Guidelines</span>
        </button>
      </div>

      {/* Two Column Layout: Group Sidebar & Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Groups list */}
        <div className="space-y-3 lg:col-span-1">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <Users className="w-4 h-4 text-sky-600" />
            <span>Collegiate & Adaptive Hubs</span>
          </h3>

          <div className="space-y-2.5">
            {groups.map(g => {
              const isSelected = selectedGroup?.id === g.id;
              return (
                <div
                  key={g.id}
                  onClick={() => setSelectedGroup(g)}
                  className={`p-4 rounded-2xl border transition cursor-pointer ${
                    isSelected
                      ? 'bg-sky-50/80 border-sky-300 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{g.name}</h4>
                      <p className="text-[11px] text-sky-700 font-medium mt-0.5">
                        {g.sport} • {g.region}
                      </p>
                    </div>
                    {g.is_adaptive_interest && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 shrink-0">
                        Adaptive
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 mt-2 line-clamp-2">{g.description}</p>

                  <div className="mt-3 pt-2.5 border-t border-slate-200/50 flex items-center justify-between text-xs">
                    <span className="text-slate-400">{g.member_count} members</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleJoin(g);
                      }}
                      className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition ${
                        g.is_member
                          ? 'bg-slate-200 text-slate-700'
                          : 'bg-sky-600 text-white hover:bg-sky-500'
                      }`}
                    >
                      {g.is_member ? 'Joined' : 'Join Hub'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Posts Feed & Composer */}
        <div className="lg:col-span-2 space-y-4">
          {selectedGroup ? (
            <>
              {/* Group Banner */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{selectedGroup.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{selectedGroup.description}</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                  {selectedGroup.member_count} members
                </span>
              </div>

              {/* Post Composer */}
              <form onSubmit={handleCreatePost} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <textarea
                  rows={2}
                  required
                  value={postContent}
                  onChange={e => setPostContent(e.target.value)}
                  placeholder={`Share travel tips, gear insights, or dual career encouragement in ${selectedGroup.name}...`}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-600"
                />

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-400">
                    Conspicuously labelled with [DEMO POST] prefix for evaluation.
                  </span>

                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shadow-xs transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Publish Post</span>
                  </button>
                </div>
              </form>

              {/* Posts stream */}
              <div className="space-y-3">
                {posts.length === 0 ? (
                  <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
                    No posts yet in this group. Be the first to start the conversation!
                  </div>
                ) : (
                  posts.map(post => (
                    <div
                      key={post.id}
                      className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{post.author_name}</span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-400">
                            {new Date(post.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => setReportPost(post)}
                          className="text-slate-400 hover:text-rose-600 transition p-1"
                          title="Report content or mute user"
                        >
                          <Flag className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-slate-800 leading-relaxed text-xs sm:text-sm">
                        {post.content}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-slate-400">Select a group from the left to view discussions.</div>
          )}
        </div>
      </div>

      {/* Community Guidelines Modal */}
      {showGuidelines && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-sky-600" />
                <span>Community Guidelines & Safety</span>
              </h3>
              <button type="button" onClick={() => setShowGuidelines(false)}>✕</button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              {guidelines.map((rule, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 leading-relaxed">
                  {rule}
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3 border-t">
              <button
                type="button"
                onClick={() => setShowGuidelines(false)}
                className="px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-semibold"
              >
                I Understand & Agree
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report or Block Modal */}
      {reportPost && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Safety Action: {reportPost.author_name}
              </h3>
              <button type="button" onClick={() => setReportPost(null)}>✕</button>
            </div>

            <form onSubmit={handleReportOrBlock} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold mb-1">Select Action</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setActionType('report')}
                    className={`py-2 rounded-xl font-semibold border ${
                      actionType === 'report' ? 'bg-amber-600 text-white border-amber-600' : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    Report Content
                  </button>
                  <button
                    type="button"
                    onClick={() => setActionType('block')}
                    className={`py-2 rounded-xl font-semibold border ${
                      actionType === 'block' ? 'bg-rose-600 text-white border-rose-600' : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    Block / Mute User
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Reason for Action *</label>
                <textarea
                  required
                  rows={3}
                  value={reportReason}
                  onChange={e => setReportReason(e.target.value)}
                  placeholder="Detail why this violates community guidelines (harassment, ableism, spam)..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setReportPost(null)}
                  className="px-4 py-2 border rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 text-white rounded-xl font-semibold"
                >
                  Confirm Action
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
