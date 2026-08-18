import React, { useState } from 'react';
import { Api, type ContributionType, type Post } from '../lib/api';
import { X, Upload, Paperclip } from 'lucide-react';

interface PostComposerProps {
    onClose: () => void;
    onPostCreated: (post: Post) => void;
}

const PostComposer: React.FC<PostComposerProps> = ({ onClose, onPostCreated }) => {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [contribType, setContribType] = useState<ContributionType>('brain_dump');
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const newTag = tagInput.trim().toLowerCase();
            if (newTag && !tags.includes(newTag)) {
                setTags([...tags, newTag]);
            }
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(t => t !== tagToRemove));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selected = e.target.files[0];
            if (selected.size > 10 * 1024 * 1024) {
                setError('File must be smaller than 10MB.');
                return;
            }
            setFile(selected);
            setError(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!title.trim()) {
            setError('Title is required.');
            return;
        }

        setIsUploading(true);
        try {
            let file_id = null;
            if (file) {
                const meta = await Api.uploadFile(file);
                file_id = meta._id;
            }

            const post = await Api.createPost({
                title: title.trim(),
                body: body.trim() || null,
                tags,
                contribution_type: contribType,
                file_id
            });

            onPostCreated(post);
        } catch (err: any) {
            setError(err.message || 'Failed to submit post.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-black/90 backdrop-blur-sm">
            <div className="bg-bg-black border border-white/10 rounded-[24px] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative flex flex-col">
                <div className="sticky top-0 bg-bg-black/90 backdrop-blur border-b border-white/10 p-5 flex items-center justify-between z-10 rounded-t-[24px]">
                    <h2 className="text-xl font-display font-black text-surface-white uppercase tracking-wide">New Post</h2>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-surface-white flex items-center justify-center text-bg-black hover:bg-gray-200 transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
                    {error && (
                        <div className="bg-card-coral/10 border border-card-coral text-card-coral px-4 py-3 rounded-xl text-sm font-bold flex items-start gap-2">
                            <span className="shrink-0 mt-0.5 text-lg leading-none">!</span>
                            <p>{error}</p>
                        </div>
                    )}

                    <div>
                        <input 
                            type="text" 
                            placeholder="Post Title..." 
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="w-full bg-transparent text-2xl font-display font-bold text-surface-white placeholder:text-text-muted focus:outline-none"
                            autoFocus
                        />
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {['brain_dump', 'shared_resource', 'taught_concept', 'reflection'].map(type => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => setContribType(type as ContributionType)}
                                className={`px-4 py-2 rounded-full text-xs font-bold uppercase transition-colors ${
                                    contribType === type 
                                    ? 'bg-card-periwinkle text-bg-black' 
                                    : 'bg-white/5 text-text-muted hover:bg-white/10 text-surface-white'
                                }`}
                            >
                                {type.replace('_', ' ')}
                            </button>
                        ))}
                    </div>

                    <div>
                        <textarea 
                            placeholder="Write your thoughts..." 
                            value={body}
                            onChange={e => setBody(e.target.value)}
                            className="w-full bg-transparent min-h-[150px] text-surface-white resize-none placeholder:text-text-muted focus:outline-none"
                        />
                    </div>

                    <div className="bg-white/5 rounded-2xl p-4 border border-white/10 focus-within:border-card-mint transition-colors">
                        <div className="flex flex-wrap gap-2 mb-2">
                            {tags.map(tag => (
                                <span key={tag} className="bg-bg-black text-surface-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 border border-white/10">
                                    #{tag}
                                    <button type="button" onClick={() => removeTag(tag)} className="opacity-50 hover:opacity-100">
                                        <X size={12} />
                                    </button>
                                </span>
                            ))}
                        </div>
                        <input 
                            type="text" 
                            placeholder="Add tags (comma or enter to save)..." 
                            value={tagInput}
                            onChange={e => setTagInput(e.target.value)}
                            onKeyDown={handleAddTag}
                            className="w-full bg-transparent text-sm text-surface-white placeholder:text-text-muted focus:outline-none"
                        />
                    </div>

                    <div className="flex items-center gap-4 border border-white/10 rounded-2xl p-4 bg-white/5 relative overflow-hidden group hover:border-card-mustard transition-colors">
                        <div className="w-10 h-10 rounded-full bg-bg-black flex items-center justify-center shrink-0">
                            <Paperclip size={18} className="text-card-mustard" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-bold text-surface-white truncate">
                                {file ? file.name : "Attach File"}
                            </p>
                            <p className="text-xs text-text-muted">
                                {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "PDF, Image, Markdown (Max 10MB)"}
                            </p>
                        </div>
                        {file && (
                            <button type="button" onClick={(e) => { e.preventDefault(); setFile(null); }} className="w-8 h-8 flex items-center justify-center bg-bg-black rounded-full hover:text-card-coral z-10 relative">
                                <X size={14} />
                            </button>
                        )}
                        <input 
                            type="file" 
                            onChange={handleFileChange}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={isUploading}
                        className="w-full bg-card-coral text-bg-black py-4 rounded-full font-bold uppercase tracking-wider text-sm mt-4 hover:opacity-90 disabled:opacity-50 flex justify-center items-center gap-2"
                    >
                        {isUploading ? <><Upload size={16} className="animate-bounce" /> Uploading...</> : 'Publish Post'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PostComposer;
