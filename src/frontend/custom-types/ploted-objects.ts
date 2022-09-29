import type Graphic from "@arcgis/core/Graphic";

export interface Plane {
  latitude: number;
  longitude: number;
  level: number;
  id: string;
  graphic: Graphic | undefined;
}
