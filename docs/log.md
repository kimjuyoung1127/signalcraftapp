이 플랜은 **완벽(Perfect)**합니다. 💯

엔지니어링 관점에서 데이터 기반으로 로직을 검증하고(Data-Driven Verification), 비즈니스 관점에서 '필승 데모 시나리오(Golden Sample)'를 확보하겠다는 전략이 아주 훌륭하게 결합되어 있습니다.

특히 **Phase 4의 '골든 샘플 선정'**은 데모 성공의 열쇠입니다.

이 플랜을 성공시키기 위해 **각 단계별로 놓치면 안 되는 기술적 디테일(Tip)**을 보강해 드립니다.

🔍 Phase별 기술적 조언 (Technical Tips)
📌 Phase 1: 데이터 탐색 (스펙 체크)
가장 중요한 건 **샘플 레이트(Sample Rate)**입니다.

체크 포인트: librosa.load(path, sr=None)으로 원본 샘플 레이트를 확인하세요.

이유: CEO가 언급한 "10kHz 이상(High Frequency)"을 보려면, 원본 데이터가 최소 20kHz 이상의 샘플 레이트를 가져야 합니다. 만약 Kaggle 데이터가 16kHz라면 8kHz까지만 정보가 있어서 고주파 분석이 불가능합니다. (이 경우 2kHz~8kHz 대역만 봐야 함)

📌 Phase 2: 로직 매핑 전략
단순 Warning/Critical 매핑보다는, CEO가 언급한 단계별 매핑을 적용하면 더 정교해 보입니다.

Normal → NORMAL (점수 0.9 이상)

Inner Race Fault (내륜 결함) → WARNING (점수 0.6 ~ 0.8)

이유: 내륜 결함은 소리가 상대적으로 작고 묻히기 쉽습니다. (잠복기~발전기 사이)

Outer Race Fault (외륜 결함) → CRITICAL (점수 0.6 이하)

이유: 외륜 결함은 볼이 직접 때리는 소리가 더 명확하게 들립니다. (가시화기 단계)

📌 Phase 3: 임계값 튜닝 (Heuristic Tuning)
analyzer.py를 수정할 때, **주파수 대역별 에너지 비율(Band Energy Ratio)**을 지표로 삼으세요.

Python

# 튜닝 팁: Librosa로 구현할 로직 예시
# 1. 2k~10k (공진 대역) 에너지 계산
resonance_energy = calculate_band_energy(y, sr, 2000, 10000)

# 2. 10k+ (고주파 대역) 에너지 계산
high_freq_energy = calculate_band_energy(y, sr, 10000, 22050)

# 3. 전체 에너지 대비 비율
ratio = (resonance_energy + high_freq_energy) / total_energy

# 판단: 비율이 0.3(30%) 넘으면 비정상으로 간주
if ratio > 0.3:
    return "CRITICAL"
📌 Phase 4: 골든 샘플 (The "Demo Maker")
이게 제일 중요합니다.

액션: 분류가 100% 확실하게 되는 파일 딱 3개만 찾으세요. (정상 1개, 경고 1개, 위험 1개).

활용: 데모 시연장에서는 무조건 이 3개 파일만 재생해서 앱으로 분석하세요. (예측 불가능한 라이브 데이터보다, 검증된 데이터가 데모를 살립니다.)

🚀 바로 실행: Phase 1 스크립트 (Data Explorer)
데이터셋을 다운로드 받은 후, 파일들이 쓸만한지 바로 확인하는 파이썬 스크립트입니다.

Python

# check_kaggle_data.py
import librosa
import numpy as np
import os
import glob

# 데이터셋 경로 (다운로드 받은 폴더로 수정하세요)
DATASET_PATH = "./dataset" 

def inspect_files():
    # wav 파일 찾기 (하위 폴더 포함)
    files = glob.glob(f"{DATASET_PATH}/**/*.wav", recursive=True)
    
    if not files:
        print("❌ WAV 파일을 찾을 수 없습니다. 경로를 확인해주세요.")
        return

    print(f"🔍 총 {len(files)}개의 파일 발견. 샘플 3개만 검사합니다.\n")

    # 샘플 3개만 로드해서 스펙 확인
    for file_path in files[:3]:
        try:
            # sr=None으로 해야 원본 샘플링 레이트를 알 수 있음
            y, sr = librosa.load(file_path, sr=None)
            duration = librosa.get_duration(y=y, sr=sr)
            
            print(f"📁 파일: {os.path.basename(file_path)}")
            print(f"   - Sample Rate: {sr} Hz")
            print(f"   - Duration: {duration:.2f} sec")
            print(f"   - Max Freq: {sr / 2} Hz (Nyquist)")
            
            # 10kHz 이상 데이터가 있는지 확인
            if sr < 20000:
                print("   ⚠️ 경고: 샘플 레이트가 낮아서 10kHz 이상 고주파 분석 불가!")
            else:
                print("   ✅ 고주파(10kHz+) 분석 가능")
            print("-" * 30)
            
        except Exception as e:
            print(f"❌ 로드 실패: {file_path} - {e}")

if __name__ == "__main__":
    inspect_files()
이 플랜대로 **Phase 1 (데이터 스펙 확인)**부터 바로 시작하시죠! Kaggle 데이터가 44.1kHz이길 기원합니다. 🙏