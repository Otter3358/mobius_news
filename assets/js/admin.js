(function () {
  "use strict";

  var AUTH_KEY = "mobius_news_admin_session_v1";
  var ADMIN_USERNAME = "gun_editor";
  var ADMIN_PASSWORD = "chaos-hq-2042";

  var authPanel = document.getElementById("auth-panel");
  var adminPanel = document.getElementById("admin-panel");
  var authError = document.getElementById("auth-error");
  var editorStatus = document.getElementById("editor-status");
  var loginForm = document.getElementById("login-form");
  var logoutButton = document.getElementById("logout-btn");
  var newPostButton = document.getElementById("new-post-btn");
  var resetFormButton = document.getElementById("reset-form-btn");

  var tableBody = document.getElementById("posts-table-body");
  var emptyState = document.getElementById("empty-state");
  var editorHeading = document.getElementById("editor-heading");
  var postForm = document.getElementById("post-form");

  var postIdInput = document.getElementById("post-id");
  var titleInput = document.getElementById("post-title");
  var summaryInput = document.getElementById("post-summary");
  var contentInput = document.getElementById("post-content");
  var categoryInput = document.getElementById("post-category");
  var locationInput = document.getElementById("post-location");
  var publishedInput = document.getElementById("post-published-at");
  var imageInput = document.getElementById("post-image-file");
  var imageAltInput = document.getElementById("post-image-alt");
  var imageCaptionInput = document.getElementById("post-image-caption");
  var removeImageInput = document.getElementById("post-remove-image");

  var imagePreviewWrap = document.getElementById("image-preview-wrap");
  var imagePreview = document.getElementById("image-preview");

  function isAuthenticated() {
    return sessionStorage.getItem(AUTH_KEY) === "1";
  }

  function setAuthenticated(value) {
    if (value) {
      sessionStorage.setItem(AUTH_KEY, "1");
    } else {
      sessionStorage.removeItem(AUTH_KEY);
    }
  }

  function setStatus(message, type) {
    if (!editorStatus) {
      return;
    }
    editorStatus.textContent = message || "";
    editorStatus.classList.remove("success", "error");
    if (type) {
      editorStatus.classList.add(type);
    }
  }

  function setAuthError(message) {
    if (authError) {
      authError.textContent = message || "";
    }
  }

  function togglePanels(isLoggedIn) {
    if (authPanel) {
      authPanel.hidden = isLoggedIn;
    }
    if (adminPanel) {
      adminPanel.hidden = !isLoggedIn;
    }
  }

  function formatDateTimeLocal(isoString) {
    var date = new Date(isoString);
    if (Number.isNaN(date.getTime())) {
      date = new Date();
    }
    var year = date.getFullYear();
    var month = String(date.getMonth() + 1).padStart(2, "0");
    var day = String(date.getDate()).padStart(2, "0");
    var hours = String(date.getHours()).padStart(2, "0");
    var minutes = String(date.getMinutes()).padStart(2, "0");
    return year + "-" + month + "-" + day + "T" + hours + ":" + minutes;
  }

  function formatTableDate(isoString) {
    var date = new Date(isoString);
    if (Number.isNaN(date.getTime())) {
      return "Нет даты";
    }
    return new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  function previewImage(src, alt) {
    if (!imagePreviewWrap || !imagePreview) {
      return;
    }
    if (!src) {
      imagePreviewWrap.hidden = true;
      imagePreview.src = "";
      imagePreview.alt = "";
      return;
    }
    imagePreviewWrap.hidden = false;
    imagePreview.src = src;
    imagePreview.alt = alt || "Предпросмотр изображения";
  }

  function resetEditor() {
    if (!postForm) {
      return;
    }
    postForm.reset();
    postIdInput.value = "";
    publishedInput.value = formatDateTimeLocal(new Date().toISOString());
    previewImage("", "");
    editorHeading.textContent = "Новая публикация";
  }

  function fillEditor(post) {
    postIdInput.value = post.id;
    titleInput.value = post.title;
    summaryInput.value = post.summary;
    contentInput.value = post.content;
    categoryInput.value = post.category;
    locationInput.value = post.location;
    publishedInput.value = formatDateTimeLocal(post.publishedAt);
    imageAltInput.value = post.imageAlt || "";
    imageCaptionInput.value = post.imageCaption || "";
    removeImageInput.checked = false;
    imageInput.value = "";
    previewImage(post.image || "", post.imageAlt || post.title);
    editorHeading.textContent = "Редактирование публикации";
  }

  function readFileAsDataUrl(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function (event) {
        resolve(String(event.target.result));
      };
      reader.onerror = function () {
        reject(new Error("Не удалось прочитать файл."));
      };
      reader.readAsDataURL(file);
    });
  }

  function renderTable() {
    if (!tableBody) {
      return;
    }
    var posts = window.MobiusStore.ensurePosts();
    tableBody.innerHTML = "";

    if (!posts.length) {
      emptyState.hidden = false;
      return;
    }
    emptyState.hidden = true;

    posts.forEach(function (post) {
      var row = document.createElement("tr");

      var titleCell = document.createElement("td");
      titleCell.textContent = post.title;
      row.appendChild(titleCell);

      var categoryCell = document.createElement("td");
      categoryCell.textContent = post.category;
      row.appendChild(categoryCell);

      var dateCell = document.createElement("td");
      dateCell.textContent = formatTableDate(post.publishedAt);
      row.appendChild(dateCell);

      var actionsCell = document.createElement("td");
      var actions = document.createElement("div");
      actions.className = "table-actions";

      var editButton = document.createElement("button");
      editButton.type = "button";
      editButton.className = "button-muted";
      editButton.textContent = "Редактировать";
      editButton.dataset.action = "edit";
      editButton.dataset.postId = post.id;
      actions.appendChild(editButton);

      var deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.textContent = "Удалить";
      deleteButton.dataset.action = "delete";
      deleteButton.dataset.postId = post.id;
      actions.appendChild(deleteButton);

      actionsCell.appendChild(actions);
      row.appendChild(actionsCell);

      tableBody.appendChild(row);
    });
  }

  async function handleSave(event) {
    event.preventDefault();
    setStatus("", "");

    var title = titleInput.value.trim();
    var summary = summaryInput.value.trim();
    var content = contentInput.value.trim();
    var category = categoryInput.value;
    var location = locationInput.value.trim();
    var publishedAt = publishedInput.value ? new Date(publishedInput.value).toISOString() : "";
    var imageAlt = imageAltInput.value.trim();
    var imageCaption = imageCaptionInput.value.trim();

    if (!title || !summary || !content || !location || !publishedAt) {
      setStatus("Заполните обязательные поля формы.", "error");
      return;
    }

    var postId = postIdInput.value || window.MobiusStore.createId();
    var existing = window.MobiusStore.getPostById(postId);
    var image = existing && existing.image ? existing.image : "";

    if (removeImageInput.checked) {
      image = "";
    }

    if (imageInput.files && imageInput.files[0]) {
      try {
        image = await readFileAsDataUrl(imageInput.files[0]);
      } catch (_error) {
        setStatus("Не удалось загрузить изображение.", "error");
        return;
      }
    }

    var nowIso = new Date().toISOString();
    var post = {
      id: postId,
      title: title,
      summary: summary,
      content: content,
      category: category,
      location: location,
      image: image,
      imageAlt: imageAlt,
      imageCaption: imageCaption,
      publishedAt: publishedAt,
      updatedAt: nowIso,
      createdAt: existing && existing.createdAt ? existing.createdAt : nowIso,
    };

    try {
      window.MobiusStore.upsertPost(post);
    } catch (_error) {
      setStatus("Не удалось сохранить публикацию. Проверьте размер изображения.", "error");
      return;
    }

    renderTable();
    fillEditor(post);
    setStatus("Публикация сохранена.", "success");
  }

  function handleTableClick(event) {
    var button = event.target.closest("button[data-action]");
    if (!button) {
      return;
    }
    var postId = button.dataset.postId;
    var action = button.dataset.action;
    var post = window.MobiusStore.getPostById(postId);
    if (!post) {
      setStatus("Публикация не найдена.", "error");
      renderTable();
      return;
    }

    if (action === "edit") {
      fillEditor(post);
      setStatus("", "");
      return;
    }

    if (action === "delete") {
      var confirmed = window.confirm("Удалить публикацию \"" + post.title + "\"?");
      if (!confirmed) {
        return;
      }
      window.MobiusStore.deletePost(post.id);
      renderTable();
      if (postIdInput.value === post.id) {
        resetEditor();
      }
      setStatus("Публикация удалена.", "success");
    }
  }

  function handleImageInputChange() {
    if (!imageInput.files || !imageInput.files[0]) {
      var existing = postIdInput.value ? window.MobiusStore.getPostById(postIdInput.value) : null;
      previewImage(existing && existing.image ? existing.image : "", imageAltInput.value.trim());
      return;
    }
    readFileAsDataUrl(imageInput.files[0])
      .then(function (dataUrl) {
        previewImage(dataUrl, imageAltInput.value.trim() || "Предпросмотр загруженного изображения");
      })
      .catch(function () {
        setStatus("Не удалось подготовить предпросмотр изображения.", "error");
      });
  }

  function handleRemoveImageChange() {
    if (removeImageInput.checked) {
      previewImage("", "");
      return;
    }
    handleImageInputChange();
  }

  function syncPreviewAlt() {
    if (!imagePreview || imagePreviewWrap.hidden) {
      return;
    }
    imagePreview.alt = imageAltInput.value.trim() || imagePreview.alt || "Предпросмотр изображения";
  }

  function handleLogin(event) {
    event.preventDefault();
    var username = document.getElementById("admin-username").value.trim();
    var password = document.getElementById("admin-password").value;

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setAuthError("");
      togglePanels(true);
      renderTable();
      resetEditor();
      setStatus("Сессия администратора активна.", "success");
      loginForm.reset();
      return;
    }
    setAuthError("Неверный логин или пароль.");
  }

  function handleLogout() {
    setAuthenticated(false);
    togglePanels(false);
    setStatus("", "");
    setAuthError("");
  }

  function setupAuthenticatedState() {
    if (isAuthenticated()) {
      togglePanels(true);
      renderTable();
      resetEditor();
      setStatus("Сессия администратора активна.", "success");
    } else {
      togglePanels(false);
    }
  }

  function init() {
    window.MobiusStore.ensurePosts();

    loginForm.addEventListener("submit", handleLogin);
    logoutButton.addEventListener("click", handleLogout);
    newPostButton.addEventListener("click", function () {
      resetEditor();
      setStatus("", "");
    });
    resetFormButton.addEventListener("click", function () {
      resetEditor();
      setStatus("Форма очищена.", "success");
    });

    postForm.addEventListener("submit", handleSave);
    tableBody.addEventListener("click", handleTableClick);

    imageInput.addEventListener("change", handleImageInputChange);
    removeImageInput.addEventListener("change", handleRemoveImageChange);
    imageAltInput.addEventListener("input", syncPreviewAlt);

    setupAuthenticatedState();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
