# PWA Badge 테스트 가이드

## 방법 A — 서버 없이 배지 API만 빠르게 확인

가장 빠른 검증 방법입니다. 실제 서버/푸시 인프라 없이 `setAppBadge()` 자체가
iOS에서 동작하는지만 확인할 때 사용하세요.

1. `index.html`, `manifest.json`, `sw.js`, 아이콘 파일(`icon-192.png`,
   `icon-512.png`)을 아무 정적 파일 서버에 올립니다.
   - **반드시 HTTPS**여야 합니다 (서비스워커 요구사항).
   - 로컬 테스트는 `ngrok http 5500` 같은 툴로 HTTPS 터널을 만들면 됩니다.
2. iPhone 사파리로 해당 URL 접속.
3. 공유 버튼 → **홈 화면에 추가**.
4. 홈 화면 아이콘으로 **직접 실행** (사파리 탭이 아니라 설치된 아이콘으로 실행해야
   `setAppBadge`가 노출됩니다).
5. 앱 안에서 "알림 권한 요청" 버튼 클릭 → 허용.
6. "배지 5로 설정" 버튼 클릭 → 홈 화면 아이콘에 숫자 배지가 뜨는지 확인.

> 알림 권한을 허용하지 않으면 `setAppBadge()`가 에러 없이 성공해도
> 실제 배지가 화면에 나타나지 않을 수 있습니다.

## 방법 B — 실제 서버 푸시로 배지 갱신 (RealTalk 실전 시나리오에 가까움)

1. 의존성 설치
   ```bash
   npm install express web-push
   ```
2. VAPID 키 생성
   ```bash
   npx web-push generate-vapid-keys
   ```
   출력된 `publicKey`, `privateKey`를 각각
   `server.js`의 `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY`,
   그리고 `index.html`의 `VAPID_PUBLIC_KEY`에 붙여넣습니다.
3. 서버 실행
   ```bash
   node server.js
   ```
4. HTTPS 터널 연결 (iOS는 HTTPS 필수)
   ```bash
   ngrok http 3000
   ```
   ngrok이 알려주는 `https://xxxx.ngrok.io` 주소를 사용합니다.
5. iPhone 사파리로 ngrok 주소 접속 → 홈 화면에 추가 → 아이콘으로 실행.
6. 앱 내에서 순서대로:
   - "알림 권한 요청" → 허용
   - "Push 구독하기" → 서버에 구독 정보 전송됨 (터미널 로그 확인)
7. PC 브라우저에서 `https://xxxx.ngrok.io/send-test` 접속.
   → 서버가 저장된 구독자에게 실제 푸시 발송.
8. iPhone 홈 화면 아이콘에 배지 숫자(3)가 뜨는지 확인.
9. 알림을 탭하면 서비스워커의 `notificationclick`에서 배지가 초기화됩니다.

## 체크리스트
- [ ] iOS 16.4 이상인지 확인
- [ ] 사파리 탭이 아니라 **홈 화면 아이콘**으로 실행 중인지 확인
- [ ] 알림 권한이 "허용" 상태인지 확인 (설정 > 알림에서도 재확인 가능)
- [ ] 접속 URL이 HTTP가 아니라 **HTTPS**인지 확인
- [ ] `icon-192.png`, `icon-512.png` 실제 아이콘 파일 준비 (매니페스트 필수 항목)
