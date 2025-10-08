import { Component, OnInit } from '@angular/core';
import { ChatbotService } from '../services/chatbot.service';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'app-update-file',
  templateUrl: './update-file.component.html',
  styleUrls: ['./update-file.component.css'],
})
export class UpdateFileComponent implements OnInit {
  fileId!: number;
  fichierSelectionne: File | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private chatbotService: ChatbotService
  ) {}

  ngOnInit(): void {
    this.fileId = +this.route.snapshot.paramMap.get('id')!;
    this.openModal();
  }

  openModal(): void {
    const modalElement = document.getElementById('updateFileModal');
    if (modalElement) {
      const modal = new (window as any).bootstrap.Modal(modalElement, {
        backdrop: 'static',
        keyboard: false,
      });
      modal.show();
      modalElement.addEventListener('hidden.bs.modal', () => {
        this.router.navigate(['/files']);
      });
    }
  }

  onFileSelected(event: any): void {
    this.fichierSelectionne = event.target.files[0];
  }

  updateFile(): void {
    if (this.fichierSelectionne) {
      this.chatbotService
        .updateFile(this.fileId, this.fichierSelectionne)
        .subscribe(() => {
          const modalElement = document.getElementById('updateFileModal');
          if (modalElement) {
            (window as any).bootstrap.Modal.getInstance(modalElement)?.hide();
          }

          this.router.navigate(['/files']);
        });
    }
  }
}
