import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Api, type Post } from '../lib/api';
import PostComposer from '../components/PostComposer';
import { Search, Plus, Paperclip } from 'lucide-react';

function useDebounce<T extends (...args: any[]) => any>(callback: T, delay: number) {
    const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    const debouncedCallback = useCallback((...args: Parameters<T>) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
            callback(...args);
        }, delay);
    }, [callback, delay]);

    return debouncedCallback;
}

const KnowledgeVault: React.FC = () => {
    const navigate = useNavigate();
    
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [allTags, setAllTags] = useState<string[]>([]);
    
    const [isComposerOpen, setIsComposerOpen] = useState(false);

    // Filters
    const [q, setQ] = useState('');
    const [activeTag, setActiveTag] = useState<string>('');
    const [activeType, setActiveType] = useState<string>('');

    const fetchPosts = async (searchQuery: string, tag: string, type: string) => {
        setLoading(true);
        try {
            const data = await Api.getFeed({ 
                q: searchQuery || undefined, 
                tags: tag ? [tag] : undefined,
                contribution_type: type || undefined
            });
            setPosts(data);
        } catch (err) {
            console.error("Failed to load feed", err);
        } finally {
            setLoading(false);
        }
    };

    // Debounced search to avoid spamming the API while typing
    const debouncedFetch = useDebounce(
        (searchQuery: string, tag: string, type: string) => fetchPosts(searchQuery, tag, type), 
        300
    );

    useEffect(() => {
        Api.getAllTags().then(setAllTags).catch(() => {});
    }, []);

    useEffect(() => {
        debouncedFetch(q, activeTag, activeType);
        // We removed the cancel method to keep the custom debounce simple.
    }, [q, activeTag, activeType, debouncedFetch]);

    return (
        <div className="max-w-5xl mx-auto py-6 relative min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-display font-black tracking-tight uppercase text-surface-white">
                    Knowledge Vault
                </h1>
                
                {/* Filter Pills */}
                <div className="hidden md:flex gap-2">
                    <select 
                        value={activeType}
                        onChange={(e) => setActiveType(e.target.value)}
                        className="bg-surface-white text-bg-black rounded-full px-4 py-2 text-sm font-bold appearance-none outline-none cursor-pointer"
                    >
                        <option value="">All Types ▾</option>
                        <option value="brain_dump">Brain Dump</option>
                        <option value="taught_concept">Taught Concept</option>
                        <option value="shared_resource">Shared Resource</option>
                        <option value="reflection">Reflection</option>
                    </select>

                    <select 
                        value={activeTag}
                        onChange={(e) => setActiveTag(e.target.value)}
                        className="bg-surface-white text-bg-black rounded-full px-4 py-2 text-sm font-bold appearance-none outline-none cursor-pointer"
                    >
                        <option value="">All Tags ▾</option>
                        {allTags.map(t => (
                            <option key={t} value={t}>#{t}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Mobile Filters */}
            <div className="flex md:hidden gap-2 mb-4">
                <select 
                    value={activeType}
                    onChange={(e) => setActiveType(e.target.value)}
                    className="flex-1 bg-surface-white text-bg-black rounded-full px-4 py-2 text-sm font-bold appearance-none outline-none"
                >
                    <option value="">All Types</option>
                    <option value="brain_dump">Brain Dump</option>
                    <option value="taught_concept">Taught Concept</option>
                    <option value="shared_resource">Shared Resource</option>
                    <option value="reflection">Reflection</option>
                </select>

                <select 
                    value={activeTag}
                    onChange={(e) => setActiveTag(e.target.value)}
                    className="flex-1 bg-surface-white text-bg-black rounded-full px-4 py-2 text-sm font-bold appearance-none outline-none"
                >
                    <option value="">All Tags</option>
                    {allTags.map(t => (
                        <option key={t} value={t}>#{t}</option>
                    ))}
                </select>
            </div>

            {/* Search Bar */}
            <div className="bg-[#1C1C1C] rounded-full flex items-center px-6 py-4 mb-6 border border-white/10 focus-within:border-surface-white transition-colors">
                <Search size={20} className="text-text-muted mr-3" />
                <input 
                    type="text"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search titles and contents..."
                    className="flex-1 bg-transparent border-none outline-none text-surface-white placeholder:text-text-muted text-lg"
                />
            </div>
            <p className="text-text-muted text-xs font-bold uppercase tracking-wider mb-8 ml-4">
                {loading ? "Searching..." : `${posts.length} entries found`}
            </p>

            {/* Feed */}
            <div className="space-y-4 pb-32">
                {!loading && posts.length === 0 && (
                    <div className="bg-bg-black border border-white/5 rounded-[24px] p-12 text-center">
                        <p className="text-text-muted font-medium">
                            {q || activeTag || activeType ? "No posts match your filters." : "The vault is empty. Drop some knowledge!"}
                        </p>
                    </div>
                )}

                {posts.map(post => (
                    <div 
                        key={post._id} 
                        onClick={() => navigate(`/vault/${post._id}`)}
                        className="bg-bg-black border border-white/10 rounded-[24px] p-6 hover:border-white/30 transition-colors cursor-pointer group flex flex-col md:flex-row gap-6 items-start"
                    >
                        <div className="flex items-center gap-3 md:w-48 shrink-0">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10 shrink-0">
                                <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${post.author.avatar_seed}`} alt="avatar" />
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-surface-white font-bold text-sm truncate">{post.author.name}</p>
                                <p className="text-text-muted text-xs truncate">{new Date(post.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4 mb-2">
                                <h3 className="text-xl font-display font-black text-surface-white uppercase truncate group-hover:text-card-cyan transition-colors">
                                    {post.title}
                                </h3>
                                {post.file_id && (
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 text-text-muted">
                                        <Paperclip size={14} />
                                    </div>
                                )}
                            </div>
                            
                            {post.body && (
                                <p className="text-text-muted text-sm line-clamp-2 mb-4 leading-relaxed">
                                    {post.body}
                                </p>
                            )}

                            <div className="flex flex-wrap gap-2">
                                <span className="bg-card-periwinkle/10 text-card-periwinkle px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
                                    {post.contribution_type.replace('_', ' ')}
                                </span>
                                {post.tags.slice(0, 3).map(t => (
                                    <span key={t} className="bg-white/5 text-surface-white px-2 py-1 rounded-md text-[10px] font-bold tracking-wider">
                                        #{t}
                                    </span>
                                ))}
                                {post.tags.length > 3 && (
                                    <span className="text-text-muted text-[10px] font-bold px-1 py-1">+{post.tags.length - 3}</span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* FAB */}
            <button 
                onClick={() => setIsComposerOpen(true)}
                className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-card-coral text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform z-40"
            >
                <Plus size={32} strokeWidth={3} />
            </button>

            {isComposerOpen && (
                <PostComposer 
                    onClose={() => setIsComposerOpen(false)}
                    onPostCreated={(_newPost) => {
                        setIsComposerOpen(false);
                        // Refresh feed and tags
                        fetchPosts(q, activeTag, activeType);
                        Api.getAllTags().then(setAllTags).catch(() => {});
                    }}
                />
            )}
        </div>
    );
};

export default KnowledgeVault;
