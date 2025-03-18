declare module '@edy/color-picker' {
  export interface ColorPickerOptions {
    color?: string;
    mode?: 'solid' | 'gradient';
    onChange?: (color: string) => void;
    presets?: string[];
  }

  export interface GradientStop {
    position: number;
    color: string;
  }

  export default class ColorPicker {
    constructor(container: string | HTMLElement, options?: ColorPickerOptions);
    
    setColor(color: string): void;
    getColor(): string;
    destroy(): void;
    
    private init(): void;
    private createElements(): void;
    private attachEvents(): void;
    private updateColor(): void;
  }
} 