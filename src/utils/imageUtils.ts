/**
 * 이미지 URL을 HTTPS로 변환하는 함수
 * @param imageUrl 원본 이미지 URL
 * @returns HTTPS로 변환된 이미지 URL
 */
export const convertToHttps = (imageUrl: string | null | undefined): string => {
  if (!imageUrl) {
    return '/default-avatar.png';
  }
  
  // 이미 HTTPS인 경우 그대로 반환
  if (imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // HTTP인 경우 HTTPS로 변환
  if (imageUrl.startsWith('http://')) {
    return imageUrl.replace('http://', 'https://');
  }
  
  // 상대 경로인 경우 그대로 반환
  return imageUrl;
};

/**
 * 이미지 로드 실패 시 기본 이미지로 대체하는 함수
 * @param event 이미지 로드 에러 이벤트
 * @param fallbackSrc 대체할 이미지 경로
 */
export const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>, fallbackSrc: string = '/default-avatar.png') => {
  const target = event.target as HTMLImageElement;
  target.src = fallbackSrc;
}; 