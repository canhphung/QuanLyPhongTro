package com.project.QLPT.experience;

import java.util.concurrent.ConcurrentHashMap;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

/**
 * Bounded, expiring limiter. Remote address comes from the container, never an untrusted header.
 */
@Component
public class AuthRateLimit {
  private record Window(long start, int attempts) {}

  private final ConcurrentHashMap<String, Window> attempts = new ConcurrentHashMap<>();
  private static final long WINDOW = 15 * 60 * 1000L;

  public void check(String address) {
    long now = System.currentTimeMillis();
    if (attempts.size() > 10000) {
      attempts.entrySet().removeIf(e -> now - e.getValue().start() > WINDOW);
      if (attempts.size() > 10000 && !attempts.containsKey(address)) throw limited();
    }
    Window w =
        attempts.compute(
            address,
            (key, old) ->
                old == null || now - old.start() > WINDOW
                    ? new Window(now, 1)
                    : new Window(old.start(), Math.min(31, old.attempts() + 1)));
    if (w.attempts() > 30) throw limited();
  }

  private ResponseStatusException limited() {
    return new ResponseStatusException(
        HttpStatus.TOO_MANY_REQUESTS,
        "Quá nhiều lần đăng nhập hoặc đăng ký. Vui lòng thử lại sau 15 phút.");
  }
}
