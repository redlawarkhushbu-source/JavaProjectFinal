package com.shetsamarthan.controller;

import com.shetsamarthan.service.OpenWeatherMapService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/weather")
@CrossOrigin(origins = "*")
public class WeatherController {

    @Autowired
    private OpenWeatherMapService openWeatherMapService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getWeather(
            @RequestParam(required = false, defaultValue = "Pune") String city,
            @RequestParam(required = false) String apiKey,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lon
    ) {
        Map<String, Object> weatherData = openWeatherMapService.fetchAgriWeather(city, apiKey, lat, lon);
        return ResponseEntity.ok(weatherData);
    }

    @GetMapping("/live")
    public ResponseEntity<Map<String, Object>> getLiveWeather(
            @RequestParam(required = false, defaultValue = "Pune") String city,
            @RequestParam(required = false) String apiKey,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lon
    ) {
        Map<String, Object> weatherData = openWeatherMapService.fetchAgriWeather(city, apiKey, lat, lon);
        return ResponseEntity.ok(weatherData);
    }
}
