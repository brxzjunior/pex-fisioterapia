import fs from 'fs';
import path from 'path';

interface AnalyticsData {
  pageViews: number;
  whatsappClicks: number;
  lastUpdated: string;
}

const ANALYTICS_FILE = path.resolve('scratch_screens/analytics_telemetry.json');

export class AnalyticsService {
  private static data: AnalyticsData = {
    pageViews: 142,
    whatsappClicks: 26,
    lastUpdated: new Date().toISOString(),
  };

  private static initialized = false;

  private static load() {
    if (this.initialized) return;
    try {
      if (fs.existsSync(ANALYTICS_FILE)) {
        const raw = fs.readFileSync(ANALYTICS_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } else {
        this.save();
      }
    } catch {
      // Fallback em memória
    }
    this.initialized = true;
  }

  private static save() {
    try {
      const dir = path.dirname(ANALYTICS_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch {
      // Ignora erro em disco
    }
  }

  static track(event: 'PAGE_VIEW' | 'WHATSAPP_CLICK') {
    this.load();
    if (event === 'PAGE_VIEW') {
      this.data.pageViews += 1;
    } else if (event === 'WHATSAPP_CLICK') {
      this.data.whatsappClicks += 1;
    }
    this.data.lastUpdated = new Date().toISOString();
    this.save();
    return this.getMetrics();
  }

  static getMetrics() {
    this.load();
    const views = Math.max(1, this.data.pageViews);
    const clicks = this.data.whatsappClicks;
    const rate = Math.min(100, Math.round((clicks / views) * 1000) / 10);

    return {
      pageViews: views,
      whatsappClicks: clicks,
      conversionRate: rate, // Ex: 18.3%
      lastUpdated: this.data.lastUpdated,
    };
  }
}
