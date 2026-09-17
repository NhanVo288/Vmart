namespace RestoreAPI.Application.Interfaces;

public record FileUploadResult(string Url, string PublicId);

public interface IFileStorageService
{
    Task<FileUploadResult> UploadAsync(Stream stream, string fileName, CancellationToken ct = default);
    Task DeleteAsync(string publicId, CancellationToken ct = default);
}
