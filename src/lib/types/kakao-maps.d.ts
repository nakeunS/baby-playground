export {};

declare global {
  interface Window {
    kakao: typeof kakao;
  }

  namespace kakao.maps {
    function load(callback: () => void): void;

    class Map {
      constructor(container: HTMLElement, options: MapOptions);
      setCenter(latlng: LatLng): void;
      panTo(latlng: LatLng): void;
      setLevel(level: number): void;
      getLevel(): number;
      setBounds(
        bounds: LatLngBounds,
        paddingTop?: number,
        paddingRight?: number,
        paddingBottom?: number,
        paddingLeft?: number,
      ): void;
    }

    class LatLng {
      constructor(lat: number, lng: number);
      getLat(): number;
      getLng(): number;
    }

    class LatLngBounds {
      constructor(sw?: LatLng, ne?: LatLng);
      extend(latlng: LatLng): void;
    }

    class Marker {
      constructor(options: MarkerOptions);
      setMap(map: Map | null): void;
      setPosition(latlng: LatLng): void;
      getPosition(): LatLng;
    }

    class CustomOverlay {
      constructor(options: CustomOverlayOptions);
      setMap(map: Map | null): void;
      setPosition(latlng: LatLng): void;
    }

    class MarkerImage {
      constructor(src: string, size: Size, options?: { offset?: Point });
    }

    class Size {
      constructor(width: number, height: number);
    }

    class Point {
      constructor(x: number, y: number);
    }

    interface MapOptions {
      center: LatLng;
      level?: number;
    }

    interface MarkerOptions {
      position: LatLng;
      map?: Map;
      title?: string;
      image?: MarkerImage;
      zIndex?: number;
    }

    interface CustomOverlayOptions {
      position: LatLng;
      content?: string | HTMLElement;
      map?: Map;
      xAnchor?: number;
      yAnchor?: number;
      zIndex?: number;
      clickable?: boolean;
    }

    namespace event {
      function addListener(
        target: Marker | Map,
        eventName: string,
        handler: (...args: unknown[]) => void,
      ): void;
      function removeListener(
        target: Marker | Map,
        eventName: string,
        handler: (...args: unknown[]) => void,
      ): void;
    }

    namespace services {
      enum Status {
        OK = "OK",
        ZERO_RESULT = "ZERO_RESULT",
        ERROR = "ERROR",
      }

      interface PlacesSearchResultItem {
        id: string;
        place_name: string;
        category_name: string;
        category_group_code: string;
        category_group_name: string;
        phone: string;
        address_name: string;
        road_address_name: string;
        x: string; // 경도
        y: string; // 위도
        place_url: string;
        distance: string;
      }

      type PlacesSearchCallback = (
        data: PlacesSearchResultItem[],
        status: Status,
        pagination: unknown,
      ) => void;

      class Places {
        constructor(map?: Map);
        keywordSearch(
          keyword: string,
          callback: PlacesSearchCallback,
          options?: Record<string, unknown>,
        ): void;
      }
    }
  }
}