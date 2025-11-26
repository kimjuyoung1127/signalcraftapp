import { AnalysisTaskResponse } from '../analysis';

// 간단한 ID 생성기
const generateId = () => Math.random().toString(36).substring(2, 15);

// 가짜 작업 저장소 (메모리)
const mockTasks: Record<string, AnalysisTaskResponse> = {};

export const mockUploadAudio = async (uri: string): Promise<string> => {
  console.log('[Mock] Uploading audio:', uri);
  
  // 가짜 딜레이 (네트워크 전송 시뮬레이션)
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const taskId = generateId();
  const createdAt = new Date().toISOString();
  
  // 초기 상태: PENDING
  mockTasks[taskId] = {
    task_id: taskId,
    status: 'PENDING',
    created_at: createdAt,
  };
  
  // 2초 후 완료 상태로 변경 시뮬레이션
  setTimeout(() => {
    const isRisk = Math.random() > 0.7; // 30% 확률로 위험/경고
    const label = isRisk ? (Math.random() > 0.5 ? 'CRITICAL' : 'WARNING') : 'NORMAL';
    
    mockTasks[taskId] = {
      ...mockTasks[taskId],
      status: 'COMPLETED',
      result: {
        label,
        score: isRisk ? 0.85 : 0.12,
        summary: isRisk 
          ? '비정상적인 진동 패턴이 감지되었습니다. 점검이 필요합니다.' 
          : '장비가 정상 작동 중입니다.',
        details: {
          noise_level: Math.floor(Math.random() * 40) + 60, // 60-100 dB
          vibration: Math.random() * 5,
          frequency: Math.floor(Math.random() * 1000) + 50,
        }
      }
    };
    console.log(`[Mock] Task ${taskId} completed with label: ${label}`);
  }, 3000); // 3초 후 분석 완료
  
  return taskId;
};

export const mockGetAnalysisResult = async (taskId: string): Promise<AnalysisTaskResponse> => {
  console.log('[Mock] Getting result for:', taskId);
  
  // 가짜 딜레이 (API 응답 시뮬레이션)
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const task = mockTasks[taskId];
  if (!task) {
    throw new Error('Task not found');
  }
  
  return task;
};
