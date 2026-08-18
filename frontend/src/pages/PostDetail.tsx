import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Api, type Post } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import FilePreview from '../components/FilePreview';
import { ArrowLeft, Trash2, Edit3, Clock } from 'lucide-react';

const PostDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Edit mode
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [editBody, setEditBody] = useState('');

    useEffect(() => {
        const fetchPost = async () => {
            if (!id) return;
            try {
                const data = await Api.getPost(id);
                setPost(data);
                setEditTitle(data.title);
                setEditBody(data.body || '');
            } catch (err: any) {
                setError("Failed to load post.");
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [id]);

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this post?")) return;
        try {
            await Api.deletePost(id!);
            navigate('/vault');
        } catch (err) {
            alert("Failed to delete post.");
        }
    };

    const handleSaveEdit = async () => {
        try {
            const updated = await Api.updatePost(id!, {
                title: editTitle,
                body: editBody || undefined
            });
            setPost({ ...post!, ...updated });
            setIsEditing(false);
        } catch (err) {
            alert("Failed to update post");
        }
    };

    if (loading) return <div className="p-8 text-surface-white">Loading...</div>;
    if (error || !post) return <div className="p-8 text-card-coral">{error || "Not found"}</div>;

    const isAuthor = user?._id === post.user_id;

    return (
        <div className="max-w-4xl mx-auto py-8">
            <button 
                onClick={() => navigate('/vault')}
                className="w-10 h-10 rounded-full bg-surface-white text-bg-black flex items-center justify-center hover:scale-105 transition-transform mb-8"
            >
                <ArrowLeft size={20} />
            </button>

            <div className="bg-bg-black border border-white/10 rounded-[32px] p-8 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10">
                            <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${post.author.avatar_seed}`} alt="avatar" />
                        </div>
                        <div>
                            <p className="text-surface-white font-bold">{post.author.name}</p>
                            <p className="text-text-muted text-xs flex items-center gap-1">
                                <Clock size={12} />
                                {new Date(post.created_at).toLocaleString()}
                                {post.edited && <span className="ml-2 italic opacity-70">(edited)</span>}
                            </p>
                        </div>
                    </div>
                    
                    {isAuthor && !isEditing && (
                        <div className="flex gap-2">
                            <button onClick={() => setIsEditing(true)} className="w-10 h-10 rounded-full bg-white/5 text-surface-white flex items-center justify-center hover:bg-white/10">
                                <Edit3 size={16} />
                            </button>
                            <button onClick={handleDelete} className="w-10 h-10 rounded-full bg-card-coral/10 text-card-coral flex items-center justify-center hover:bg-card-coral/20">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    )}
                </div>

                {isEditing ? (
                    <div className="space-y-4 mb-6">
                        <input 
                            className="w-full bg-transparent text-3xl font-display font-black text-surface-white border-b border-white/20 pb-2 focus:outline-none"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                        />
                        <textarea 
                            className="w-full bg-white/5 rounded-2xl p-4 text-surface-white min-h-[200px] resize-none focus:outline-none focus:ring-1 ring-white/20"
                            value={editBody}
                            onChange={(e) => setEditBody(e.target.value)}
                        />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setIsEditing(false)} className="px-6 py-2 rounded-full text-surface-white bg-white/5 hover:bg-white/10 font-bold text-sm">Cancel</button>
                            <button onClick={handleSaveEdit} className="px-6 py-2 rounded-full text-bg-black bg-surface-white font-bold text-sm hover:scale-105 transition-transform">Save</button>
                        </div>
                    </div>
                ) : (
                    <>
                        <h1 className="text-3xl font-display font-black text-surface-white mb-6 uppercase tracking-tight leading-tight">
                            {post.title}
                        </h1>
                        
                        <div className="flex flex-wrap gap-2 mb-8">
                            <span className="bg-card-periwinkle/20 text-card-periwinkle px-3 py-1 rounded-full text-xs font-bold uppercase">
                                {post.contribution_type.replace('_', ' ')}
                            </span>
                            {post.tags.map(t => (
                                <span key={t} className="bg-white/5 text-surface-white px-3 py-1 rounded-full text-xs font-bold border border-white/10">
                                    #{t}
                                </span>
                            ))}
                        </div>

                        {post.body && (
                            <div className="prose prose-invert max-w-none text-surface-white/90 whitespace-pre-wrap leading-relaxed mb-8">
                                {post.body}
                            </div>
                        )}
                    </>
                )}

                {post.file_id && !isEditing && (
                    <FilePreview file_id={post.file_id} />
                )}
            </div>
        </div>
    );
};

export default PostDetail;
