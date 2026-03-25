-- ============================================================
-- 多态关联 CHECK 约束（recipeId/postId 二选一）
-- 在首次 prisma migrate 后手动执行或添加到迁移文件中
-- ============================================================

-- TagsOnContent: 必须关联 recipe 或 post，不能同时为空或同时非空
ALTER TABLE "TagsOnContent" ADD CONSTRAINT "tagoncontent_target_check"
  CHECK (("recipeId" IS NOT NULL AND "postId" IS NULL) OR ("recipeId" IS NULL AND "postId" IS NOT NULL));

-- Comment: 必须关联 recipe 或 post
ALTER TABLE "Comment" ADD CONSTRAINT "comment_target_check"
  CHECK (("recipeId" IS NOT NULL AND "postId" IS NULL) OR ("recipeId" IS NULL AND "postId" IS NOT NULL));

-- Like: 必须关联 recipe 或 post
ALTER TABLE "Like" ADD CONSTRAINT "like_target_check"
  CHECK (("recipeId" IS NOT NULL AND "postId" IS NULL) OR ("recipeId" IS NULL AND "postId" IS NOT NULL));

-- Favorite: 必须关联 recipe 或 post
ALTER TABLE "Favorite" ADD CONSTRAINT "favorite_target_check"
  CHECK (("recipeId" IS NOT NULL AND "postId" IS NULL) OR ("recipeId" IS NULL AND "postId" IS NOT NULL));

-- ============================================================
-- 部分唯一索引（替代 Prisma 的 @@unique，正确处理 NULL）
-- ============================================================

-- TagsOnContent
CREATE UNIQUE INDEX "tagoncontent_tag_recipe" ON "TagsOnContent"("tagId", "recipeId") WHERE "recipeId" IS NOT NULL;
CREATE UNIQUE INDEX "tagoncontent_tag_post" ON "TagsOnContent"("tagId", "postId") WHERE "postId" IS NOT NULL;

-- Like
CREATE UNIQUE INDEX "like_user_recipe" ON "Like"("userId", "recipeId") WHERE "recipeId" IS NOT NULL;
CREATE UNIQUE INDEX "like_user_post" ON "Like"("userId", "postId") WHERE "postId" IS NOT NULL;
CREATE INDEX "like_recipe_idx" ON "Like"("recipeId") WHERE "recipeId" IS NOT NULL;
CREATE INDEX "like_post_idx" ON "Like"("postId") WHERE "postId" IS NOT NULL;

-- Favorite
CREATE UNIQUE INDEX "fav_user_recipe" ON "Favorite"("userId", "recipeId") WHERE "recipeId" IS NOT NULL;
CREATE UNIQUE INDEX "fav_user_post" ON "Favorite"("userId", "postId") WHERE "postId" IS NOT NULL;
CREATE INDEX "fav_recipe_idx" ON "Favorite"("recipeId") WHERE "recipeId" IS NOT NULL;
CREATE INDEX "fav_post_idx" ON "Favorite"("postId") WHERE "postId" IS NOT NULL;
