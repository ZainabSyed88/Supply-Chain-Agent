import { useEffect, useState } from "react"
import { CloudRain } from "lucide-react"
import { api } from "../../utils/api"

export default function WeatherWidget({ supplierId }) {
  const [weather, setWeather] = useState(null)

  useEffect(() => {
    let active = true

    const loadWeather = async () => {
      try {
        const data = await api.getWeatherAlerts()
        const supplierWeather = data.supplier_weather?.find((item) => item.supplier_id === supplierId)
        if (active) {
          setWeather(supplierWeather?.weather || null)
        }
      } catch {
        if (active) {
          setWeather(null)
        }
      }
    }

    loadWeather()
    return () => {
      active = false
    }
  }, [supplierId])

  if (!weather) {
    return null
  }

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs ${
        weather.is_severe ? "border-amber-200 bg-amber-50 text-amber-700" : "border-slate-200 bg-slate-50 text-slate-600"
      }`}
    >
      {weather.icon_url ? <img src={weather.icon_url} alt="" className="h-5 w-5" /> : <CloudRain className="h-4 w-4" />}
      <span className="font-medium">{Math.round(weather.temperature_c || 0)}°C</span>
      <span className="capitalize">{weather.weather_description}</span>
      {weather.is_severe ? <span className="font-semibold">Severe</span> : null}
    </div>
  )
}
