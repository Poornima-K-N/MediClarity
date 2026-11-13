import os
import shutil
import tempfile
import uuid
from werkzeug.utils import secure_filename

class EphemeralDirectory:
    """
    Context manager ensuring temporary disk storage is immediately and
    guaranteed to be scrubbed, even if processing raises an unhandled exception.
    """
    def __init__(self, prefix="medclarity_ephemeral_"):
        self.prefix = prefix
        self.temp_dir = None

    def __enter__(self):
        self.temp_dir = tempfile.mkdtemp(prefix=self.prefix)
        return self.temp_dir

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.temp_dir and os.path.exists(self.temp_dir):
            try:
                shutil.rmtree(self.temp_dir, ignore_errors=True)
            except Exception:
                pass


def save_ephemeral_file(file_storage, target_dir):
    """
    Saves an uploaded FileStorage to an ephemeral directory with
    a sanitized filename and UUID prefix to prevent collisions
    and directory traversal attacks.
    """
    original_name = file_storage.filename or "uploaded_document"
    safe_name = secure_filename(original_name)
    if not safe_name:
        safe_name = "document"

    unique_filename = f"{uuid.uuid4().hex[:12]}_{safe_name}"
    file_path = os.path.join(target_dir, unique_filename)
    file_storage.save(file_path)
    return file_path, safe_name
