INSERT INTO "RoomOption" (id, value, type, "order", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), '1', 'resale', 0, NOW(), NOW()),
  (gen_random_uuid(), '2', 'resale', 1, NOW(), NOW()),
  (gen_random_uuid(), '3', 'resale', 2, NOW(), NOW()),
  (gen_random_uuid(), '4', 'resale', 3, NOW(), NOW()),
  (gen_random_uuid(), '5+', 'resale', 4, NOW(), NOW()),
  (gen_random_uuid(), 'Studio', 'off-plan', 0, NOW(), NOW()),
  (gen_random_uuid(), '2', 'off-plan', 1, NOW(), NOW()),
  (gen_random_uuid(), '3', 'off-plan', 2, NOW(), NOW()),
  (gen_random_uuid(), '4', 'off-plan', 3, NOW(), NOW());
