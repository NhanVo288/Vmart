using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.Extensions.Logging;
using RestoreAPI.Application.Interfaces;
using RestoreAPI.Application.Requests;

namespace RestoreAPI.Infrastructure.Services;

public class CloudinaryFileStorageService : IFileStorageService
{
    private readonly Cloudinary _cloudinary;
    private readonly ILogger<CloudinaryFileStorageService> _logger;

    public CloudinaryFileStorageService(CloudinarySettings settings, ILogger<CloudinaryFileStorageService> logger)
    {
        var account = new Account(settings.CloudName, settings.ApiKey, settings.ApiSecret);
        _cloudinary = new Cloudinary(account);
        _logger = logger;
    }

    public async Task<FileUploadResult> UploadAsync(Stream stream, string fileName, CancellationToken ct = default)
    {
        var uploadParams = new ImageUploadParams
        {
            File = new FileDescription(fileName, stream),
            UseFilename = true,
            UniqueFilename = true,
            Overwrite = false,
        };

        var result = await _cloudinary.UploadAsync(uploadParams);
        if (result.StatusCode != System.Net.HttpStatusCode.OK)
        {
            _logger.LogError("Cloudinary upload failed for {FileName}: {Error}", fileName, result.Error?.Message);
            throw new Exception($"Cloudinary upload failed: {result.Error?.Message}");
        }

        _logger.LogInformation("Image uploaded to Cloudinary: {FileName}", fileName);
        return new FileUploadResult(result.SecureUrl.ToString(), result.PublicId);
    }

    public async Task DeleteAsync(string publicId, CancellationToken ct = default)
    {
        var deleteParams = new DeletionParams(publicId);
        var result = await _cloudinary.DestroyAsync(deleteParams);

        if (result.Result != "ok" && result.Result != "not found")
            throw new Exception($"Failed to delete image: {result.Result}");

        _logger.LogInformation("Image deleted from Cloudinary: {PublicId}", publicId);
    }
}
