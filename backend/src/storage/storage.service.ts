import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  BlobServiceClient,
  BlockBlobClient,
  StorageSharedKeyCredential,
} from '@azure/storage-blob';
import { AppLogger } from '@/logger/app-logger.service';

@Injectable()
export class StorageService {
  private readonly blobServiceClient: BlobServiceClient;
  private readonly containerUploads: string;
  private readonly containerGenerated: string;

  constructor(
    private readonly config: ConfigService,
    private readonly logger: AppLogger,
  ) {
    const connectionString = this.config.get<string>('azureStorage.connectionString')!;
    this.blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    this.containerUploads = this.config.get<string>('azureStorage.containerUploads')!;
    this.containerGenerated = this.config.get<string>('azureStorage.containerGenerated')!;
  }

  /**
   * Upload a file buffer to Azure Blob Storage.
   * Returns the blob path (container/blobName).
   */
  async uploadFile(
    buffer: Buffer,
    blobName: string,
    mimeType: string,
    container = this.containerUploads,
  ): Promise<string> {
    const containerClient = this.blobServiceClient.getContainerClient(container);
    await containerClient.createIfNotExists();

    const blockBlobClient: BlockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: { blobContentType: mimeType },
    });

    this.logger.logEvent({
      type: 'BLOB_UPLOAD',
      status: 'success',
      metadata: { blobName, container },
    });

    return `${container}/${blobName}`;
  }

  /**
   * Download a blob and return its buffer.
   */
  async downloadFile(blobPath: string): Promise<Buffer> {
    const [container, ...rest] = blobPath.split('/');
    const blobName = rest.join('/');

    const containerClient = this.blobServiceClient.getContainerClient(container);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    const downloadResponse = await blockBlobClient.downloadToBuffer();
    return downloadResponse;
  }

  /**
   * Delete a blob from storage.
   */
  async deleteFile(blobPath: string): Promise<void> {
    const [container, ...rest] = blobPath.split('/');
    const blobName = rest.join('/');

    const containerClient = this.blobServiceClient.getContainerClient(container);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.deleteIfExists();
  }

  /**
   * Generate a blob name for uploaded documents.
   */
  generateBlobName(sessionId: string, originalName: string): string {
    const ext = originalName.split('.').pop();
    const timestamp = Date.now();
    return `${sessionId}/${timestamp}-${originalName}`;
  }

  /**
   * Generate a blob name for generated DUA documents.
   */
  generateDuaBlobName(sessionId: string): string {
    return `${sessionId}/dua-${Date.now()}.docx`;
  }
}
