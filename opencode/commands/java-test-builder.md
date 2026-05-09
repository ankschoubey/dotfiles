Create a Java test data builder for the class: $ARGUMENTS

Instructions:
1. First, search the current project to find the class definition. Look in common locations like `src/main/java/`, `src/main/resources/`, or any file that might contain the class.
2. If you cannot find the class in the codebase, ask the user to provide the class definition.
3. Once you have the class:
   - Create a builder class named `Test{ClassName}Builder` (e.g., `TestUserBuilder`)
   - Save it to `src/test/java/com/svaaya/app/testutils/Test{ClassName}Builder.java` (create the directory if needed)
   - The package should be `com.svaaya.app.testutils`
   
   The builder should follow this pattern:
   - Class properties with sensible default values (use `TestUtils.faker()` for random data)
   - Constructor with no arguments
   - Methods for each property that return `this` (fluent API)
   - Any enum properties should have convenience methods (e.g., `.admin()` for setting role to Admin)
   - A `build()` method that returns the full typed object
   - Use `ReflectionTestUtils.setField()` for setting private fields if needed
   
4. For embedded/nested objects in the class:
   - Check if there's already an existing builder in `com.svaaya.app.testutils`
   - If a builder exists (e.g., `TestUserBuilder` for a `user` property), use it in the `build()` method
   - Example: if the class has a `user: User` property, use `new TestUserBuilder().build()`

5. Use proper Java imports and import the class and any enums from the appropriate location.

Example reference:
```java
package com.svaaya.app.testutils;

import com.svaaya.app.commons.domain.EmailAddress;
import com.svaaya.app.commons.domain.PhoneNumber;
import com.svaaya.app.features.user.data.AuthSource;
import com.svaaya.app.features.user.data.Role;
import com.svaaya.app.features.user.data.User;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.UUID;

import static com.svaaya.app.testutils.TestUtils.faker;
import static com.svaaya.app.testutils.TestUtils.random;

public class TestUserBuilder {

    Role role = Role.CUSTOMER;
    String firstName;
    String lastName;
    UUID id;

    public TestUserBuilder id(UUID id) {
        this.id = id;
        return this;
    }

    public TestUserBuilder role(Role role) {
        this.role = role;
        return this;
    }

    public TestUserBuilder professional() {
        return role(Role.PROFESSIONAL);
    }

    public TestUserBuilder admin() {
        return role(Role.ADMIN);
    }

    public TestUserBuilder customer() {
        return role(Role.CUSTOMER);
    }

    public TestUserBuilder firstName(String firstName) {
        this.firstName = firstName;
        return this;
    }

    public TestUserBuilder lastName(String lastName) {
        this.lastName = lastName;
        return this;
    }

    public User build() {
        var user = User.builder()
                .email(EmailAddress.from(faker.internet().emailAddress()))
                .password(faker.internet().password())
                .phoneNumber(random.nextObject(PhoneNumber.class))
                .role(role)
                .source(AuthSource.WEB)
                .firstName(firstName != null ? firstName : faker.name().firstName())
                .lastName(lastName != null ? lastName : faker.name().lastName())
                .build();
        if (id != null) {
            ReflectionTestUtils.setField(user, "id", id);
        }
        return user;
    }
}
```

Generate the builder now.