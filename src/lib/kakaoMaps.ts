const KAKAO_MAPS_SCRIPT_ID = "kakao-maps-script";

let loadPromise: Promise<void> | null = null;

/**
 * 카카오맵 JS SDK(sdk.js)를 1회만 로드합니다.
 * autoload=false로 불러온 뒤 kakao.maps.load()로 초기화가 끝났을 때
 * resolve 되므로, 이 함수가 끝나면 바로 window.kakao.maps.* 를 써도 안전합니다.
 * libraries=services 를 포함해서 키워드 장소 검색(Places)까지 함께 로드합니다.
 */
export function loadKakaoMapsScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(
      new Error("카카오맵은 브라우저 환경에서만 로드할 수 있습니다."),
    );
  }

  if (window.kakao?.maps) {
    return Promise.resolve();
  }

  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = new Promise((resolve, reject) => {
    const appKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;

    if (!appKey) {
      loadPromise = null;
      reject(
        new Error("NEXT_PUBLIC_KAKAO_JS_KEY 환경변수가 설정되지 않았습니다."),
      );
      return;
    }

    const existingScript = document.getElementById(
      KAKAO_MAPS_SCRIPT_ID,
    ) as HTMLScriptElement | null;

    if (existingScript) {
      existingScript.addEventListener("load", () => {
        window.kakao.maps.load(() => resolve());
      });
      existingScript.addEventListener("error", () => {
        loadPromise = null;
        reject(new Error("카카오맵 스크립트 로드에 실패했습니다."));
      });
      return;
    }

    const script = document.createElement("script");
    script.id = KAKAO_MAPS_SCRIPT_ID;
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false&libraries=services`;
    script.async = true;

    // 디버깅용: 문제 해결되면 이 줄은 지우셔도 됩니다.
    console.log("[kakaoMaps] 로드 시도 URL:", script.src);

    script.onload = () => {
      window.kakao.maps.load(() => resolve());
    };
    script.onerror = () => {
      loadPromise = null;
      reject(new Error("카카오맵 스크립트 로드에 실패했습니다."));
    };

    document.head.appendChild(script);
  });

  return loadPromise;
}