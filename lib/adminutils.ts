// utils/adminUtils.ts

export function createImageUploader(inputId: string, currentValue = ''): string {
  const uploaderId = `uploader-${inputId}`;
  const previewId = `preview-${inputId}`;
  const removeId = `remove-${inputId}`;

  return `
    <div class="image-uploader-container">
      <div class="flex items-center space-x-4">
        <div class="flex-1">
          <input type="url" id="${inputId}" value="${currentValue}" 
                 class="w-full px-3 py-2 border border-rose-tan-light rounded focus:ring-2 focus:ring-rose-tan"
                 placeholder="Enter image URL or upload below">
        </div>
        <div class="flex flex-col space-y-2">
          <input type="file" id="${uploaderId}" accept="image/*" class="hidden">
          <button type="button" onclick="document.getElementById('${uploaderId}').click()" 
                  class="bg-rose-tan text-white px-4 py-2 rounded-lg font-medium hover:bg-rose-tan-dark transition-colors text-sm">
              Upload Image
          </button>
          ${
            currentValue
              ? `<button type="button" id="${removeId}" onclick="removeImage('${inputId}')" 
                      class="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors text-sm">
                  Remove Image
                </button>`
              : ''
          }
        </div>
      </div>
      <div id="${previewId}" class="mt-3">
        ${
          currentValue
            ? `<img src="${currentValue}" alt="Preview" class="h-20 w-20 object-cover rounded-lg border">`
            : ''
        }
      </div>
    </div>
  `;
}

export function setupImageUploader(inputId: string, showNotification: (msg: string, type: 'success' | 'error') => void) {
  const uploaderId = `uploader-${inputId}`;
  const previewId = `preview-${inputId}`;

  const uploaderElement = document.getElementById(uploaderId) as HTMLInputElement;
  if (uploaderElement) {
    uploaderElement.addEventListener('change', function (e) {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        showNotification('Please select a valid image file.', 'error');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showNotification('Image size must be less than 5MB.', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = function (event) {
        const base64String = event.target?.result as string;

        // Update the URL input with base64 data
        const inputElement = document.getElementById(inputId) as HTMLInputElement;
        if (inputElement) inputElement.value = base64String;

        // Update preview
        const previewElement = document.getElementById(previewId);
        if (previewElement) {
          previewElement.innerHTML = `<img src="${base64String}" alt="Preview" class="h-20 w-20 object-cover rounded-lg border">`;
        }

        showNotification('Image uploaded successfully!', 'success');
      };
      reader.readAsDataURL(file);
    });
  }
}

export function removeImage(inputId: string, showNotification: (msg: string, type: 'success' | 'error') => void) {
  const previewId = `preview-${inputId}`;
  const removeId = `remove-${inputId}`;

  const inputElement = document.getElementById(inputId) as HTMLInputElement;
  if (inputElement) inputElement.value = '';

  const previewElement = document.getElementById(previewId);
  if (previewElement) previewElement.innerHTML = '';

  const removeButton = document.getElementById(removeId);
  if (removeButton) removeButton.remove();

  showNotification('Image removed successfully!', 'success');
}
