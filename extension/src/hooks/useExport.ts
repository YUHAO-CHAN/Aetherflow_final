import { useState, useCallback } from 'react';
import { exportPromptsToCSV } from '../services/export';

/**
 * 提供与导出相关的功能和状态管理的hook
 */
export function useExport() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportToCSV = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await exportPromptsToCSV();
      
      if (result) {
        setSuccess(true);
        // 2秒后重置成功状态
        setTimeout(() => setSuccess(false), 2000);
      } else {
        setError('导出失败，请稍后重试');
      }
    } catch (err) {
      console.error('导出过程中发生错误:', err);
      setError('导出过程中发生错误');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    exportToCSV,
    loading,
    success,
    error
  };
} 