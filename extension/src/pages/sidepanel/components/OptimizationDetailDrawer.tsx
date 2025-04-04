import React, { useState, useEffect } from 'react';
import { X, Copy, Star, Clock, Edit, Save, Check, AlertCircle } from 'lucide-react';
import { formatDate } from '../../../utils/formatDate';
import { usePromptsData } from '../../../hooks/usePromptsData';
import type { OptimizationVersion } from '../../../services/optimization';
import { 
  getVersionDisplayContent,
  startEditVersion,
  saveEditedVersion,
  cancelEditVersion,
  toggleFavoriteVersion,
  getFavoriteStatus
} from '../../../services/optimization';

interface OptimizationDetailDrawerProps {
  version: OptimizationVersion | undefined;
  isOpen: boolean;
  onClose: () => void;
  onContinueOptimize?: (version: OptimizationVersion) => void;
  onUpdateVersion?: (versionId: number, updates: Partial<OptimizationVersion>) => void;
  onCopy?: (content: string) => void;
  onSaveToLibrary?: (content: string) => void;
}

export function OptimizationDetailDrawer({ 
  version, 
  isOpen, 
  onClose,
  onContinueOptimize,
  onUpdateVersion,
  onCopy: externalCopy,
  onSaveToLibrary
}: OptimizationDetailDrawerProps) {
  // 本地状态
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  // 添加收藏版本ID列表
  const [favoriteVersions, setFavoriteVersions] = useState<number[]>([]);
  // 添加复制反馈状态
  const [copySuccess, setCopySuccess] = useState(false);
  
  // 获取提示词API
  const { addPrompt } = usePromptsData();
  
  // 当版本变化时更新本地状态
  useEffect(() => {
    if (version) {
      // 使用服务层函数获取编辑内容
      setEditContent(startEditVersion(version));
    }
  }, [version]);
  
  // 复制成功后的反馈效果
  useEffect(() => {
    if (copySuccess) {
      const timer = setTimeout(() => {
        setCopySuccess(false);
      }, 2000); // 2秒后恢复按钮状态
      return () => clearTimeout(timer);
    }
  }, [copySuccess]);
  
  if (!isOpen || !version) return null;
  
  // 获取显示内容，使用服务层函数
  const displayContent = getVersionDisplayContent(version);
  
  // 创建日期
  const created = version.createdAt ? formatDate(version.createdAt) : '未知时间';
  
  // 处理复制内容
  const handleCopy = () => {
    if (externalCopy) {
      externalCopy(displayContent);
    } else {
      navigator.clipboard.writeText(displayContent)
        .then(() => {
          setCopySuccess(true);
        })
        .catch(err => {
          console.error('复制失败:', err);
          // 也可以在这里显示错误反馈
        });
    }
    setCopySuccess(true);
  };
  
  // 开始编辑 - 使用服务层函数
  const handleStartEdit = () => {
    setIsEditing(true);
  };
  
  // 保存编辑 - 使用服务层函数
  const handleSaveEdit = () => {
    if (version && onUpdateVersion) {
      // 使用服务层函数获取需要更新的内容
      const updates = saveEditedVersion(version, editContent);
      onUpdateVersion(version.id, updates);
      setIsEditing(false);
    }
  };
  
  // 取消编辑 - 使用服务层函数
  const handleCancelEdit = () => {
    if (version) {
      setEditContent(cancelEditVersion(version));
    }
    setIsEditing(false);
  };
  
  // 处理双击编辑
  const handleDoubleClick = () => {
    if (!isEditing) {
      setIsEditing(true);
    }
  };
  
  // 处理收藏 - 使用服务层函数
  const handleToggleFavorite = async () => {
    if (version) {
      try {
        // 调用服务层函数处理收藏逻辑
        const saveToLibraryFn = onSaveToLibrary ? onSaveToLibrary : 
          async (content: string) => {
            await addPrompt({
              title: content.length > 30 ? content.substring(0, 30) + '...' : content,
              content: content,
              isFavorite: true,
              favorite: true
            });
          };
          
        const updatedFavorites = await toggleFavoriteVersion(
          version,
          favoriteVersions,
          saveToLibraryFn
        );
        
        // 更新本地收藏状态
        setFavoriteVersions(updatedFavorites);
        // 更新UI状态
        setIsFavorite(getFavoriteStatus(version.id, updatedFavorites));
      } catch (error) {
        console.error('切换收藏状态失败:', error);
      }
    }
  };
  
  // 处理继续优化
  const handleContinueOptimize = () => {
    if (version && onContinueOptimize) {
      onContinueOptimize(version);
    }
  };
  
  return (
    <div className={`fixed inset-y-0 right-0 w-80 bg-gradient-to-br from-magic-800 to-magic-900 border-l border-magic-700/30 shadow-xl z-30 transform transition-transform duration-300 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      {/* 抽屉头部 */}
      <div className="flex items-center justify-between p-4 border-b border-magic-700/30 flex-shrink-0">
        <h3 className="text-lg font-semibold text-magic-200 truncate">优化版本详情</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-magic-700/50 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-magic-400" />
        </button>
      </div>
      
      {/* 抽屉内容 - 使用flex-1和overflow-y-auto使内容区域可滚动 */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* 版本标题 */}
        <h2 className="text-lg font-bold text-magic-200 mb-4">
          版本 v{version.id} {version.isEdited ? '(已编辑)' : ''}
        </h2>
        
        {/* 内容 */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-magic-400 mb-2">内容</h4>
          {isEditing ? (
            <div>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full bg-magic-800 border border-magic-600 rounded-md p-3 text-magic-200 max-h-[300px] min-h-[150px] scrollbar-thin scrollbar-thumb-magic-600 scrollbar-track-magic-800"
                autoFocus
              />
              <div className="text-xs text-magic-400 mt-1 mb-2">点击外部保存</div>
            </div>
          ) : (
            <div 
              className="bg-magic-800/50 border border-magic-700/30 rounded-md p-3 text-magic-200 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-magic-600 scrollbar-track-magic-800 cursor-text whitespace-pre-wrap"
              onDoubleClick={handleDoubleClick}
            >
              {displayContent}
            </div>
          )}
        </div>
        
        {/* 元数据 */}
        <div className="mb-6 space-y-2">
          <div className="flex items-center text-sm text-magic-400">
            <Clock className="w-4 h-4 mr-2" /> 
            <span>创建于: {created}</span>
          </div>
          {version.parentId && (
            <div className="flex items-center text-sm text-magic-400">
              <Clock className="w-4 h-4 mr-2" /> 
              <span>基于版本: v{version.parentId}</span>
            </div>
          )}
        </div>
        
        {/* 操作按钮 */}
        <div className="flex flex-col space-y-3">
          {isEditing ? (
            <div className="flex space-x-2">
              <button
                onClick={handleSaveEdit}
                className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600/80 text-white rounded-md hover:bg-green-500/80 transition-colors"
              >
                <Save className="w-4 h-4 mr-2" />
                保存修改
              </button>
              <button
                onClick={handleCancelEdit}
                className="flex-1 flex items-center justify-center px-4 py-2 bg-magic-700/50 text-magic-200 rounded-md hover:bg-magic-600/50 transition-colors"
              >
                <X className="w-4 h-4 mr-2" />
                取消
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={handleContinueOptimize}
                className="flex items-center justify-center px-4 py-2 bg-magic-600 text-white rounded-md hover:bg-magic-500 transition-colors"
              >
                基于此版本继续优化
              </button>
              
              <div className="flex space-x-2">
                <button
                  onClick={handleStartEdit}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-magic-700/50 text-magic-200 rounded-md hover:bg-magic-600/50 transition-colors"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  编辑
                </button>
                <button
                  onClick={handleCopy}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-magic-700/50 text-magic-200 rounded-md hover:bg-magic-600/50 transition-colors relative overflow-hidden"
                >
                  {copySuccess ? (
                    <>
                      <Check className="w-4 h-4 mr-2 text-green-400" />
                      <span className="text-green-400">已复制</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      复制
                    </>
                  )}
                </button>
              </div>
              
              <button
                onClick={handleToggleFavorite}
                className={`flex items-center justify-center px-4 py-2 ${
                  isFavorite
                    ? 'bg-yellow-600/30 text-yellow-300'
                    : 'bg-magic-700/50 text-magic-200'
                } rounded-md hover:bg-magic-600/50 transition-colors`}
              >
                <Star className={`w-4 h-4 mr-2 ${isFavorite ? 'fill-yellow-300' : ''}`} />
                {isFavorite ? '已收藏' : '添加到收藏'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 