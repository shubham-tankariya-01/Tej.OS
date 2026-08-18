import React, { useState } from 'react';
import { Api } from '../lib/api';
import { Download, File as FileIcon } from 'lucide-react';

interface FilePreviewProps {
    file_id: string;
}

const FilePreview: React.FC<FilePreviewProps> = ({ file_id }) => {
    // We don't have the FileMeta here unless we fetch it or it's passed.
    // To keep it simple, we just use the url directly. If it's an image, browser renders it.
    // But since we need to know what type it is, we might just try rendering it as an img, and if it fails, fallback to download.
    // Or just provide a download link. Wait, we want inline previews if possible.
    
    const [isImage, setIsImage] = useState(true);
    const fileUrl = Api.getFileUrl(file_id);

    return (
        <div className="mt-4 border border-white/10 rounded-[24px] overflow-hidden bg-[#1A1A1A]">
            {isImage ? (
                <div className="relative group">
                    <img 
                        src={fileUrl} 
                        alt="Attached file" 
                        className="w-full h-auto max-h-[500px] object-contain bg-black/50"
                        onError={() => setIsImage(false)}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <a 
                            href={fileUrl} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="w-12 h-12 rounded-full bg-surface-white text-bg-black flex items-center justify-center hover:scale-105 transition-transform"
                        >
                            <Download size={20} />
                        </a>
                    </div>
                </div>
            ) : (
                <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-card-periwinkle/20 text-card-periwinkle flex items-center justify-center shrink-0">
                            <FileIcon size={24} />
                        </div>
                        <div>
                            <p className="font-bold text-surface-white text-sm">Attached File</p>
                            <p className="text-xs text-text-muted">Click to view or download</p>
                        </div>
                    </div>
                    <a 
                        href={fileUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="w-10 h-10 rounded-full bg-surface-white text-bg-black flex items-center justify-center hover:scale-105 transition-transform"
                    >
                        <Download size={16} />
                    </a>
                </div>
            )}
        </div>
    );
};

export default FilePreview;
