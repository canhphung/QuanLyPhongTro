package com.project.QLPT.config;

import java.time.Clock;
import java.time.ZoneId;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

@Configuration
public class BusinessTimeConfig {
  /** Date-only and local date-time inputs represent Vietnamese business time. */
  @Bean
  LocalValidatorFactoryBean domainValidator() {
    var validator = new LocalValidatorFactoryBean();
    validator.setConfigurationInitializer(
        config -> config.clockProvider(() -> Clock.system(ZoneId.of("Asia/Ho_Chi_Minh"))));
    return validator;
  }
}
