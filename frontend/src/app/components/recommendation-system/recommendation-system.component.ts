import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TitleCasePipe } from '@angular/common';
import { ProfilesService } from '../../services/profiles/profiles.service';
import { ProfileDetailComponent } from '../profile-detail/profile-detail.component';
import { ISkyblockProfile } from '@shared/models/profile.model';

@Component({
  selector: 'app-recommendation-system',
  standalone: true,
  imports: [ReactiveFormsModule, TitleCasePipe, ProfileDetailComponent],
  templateUrl: './recommendation-system.component.html',
  styleUrl: './recommendation-system.component.scss'
})
export class RecommendationSystemComponent {

  public profilesService = inject(ProfilesService);
  public usernameForm = new FormControl('', { nonNullable: true });

  public search(): void {
    const username = this.usernameForm.value.trim();
    if (username) {
      this.profilesService.lookup(username);
    }
  }

  public select(profile: ISkyblockProfile): void {
    this.profilesService.selectProfile(profile);
  }
}
