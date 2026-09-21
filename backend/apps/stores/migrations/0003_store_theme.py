from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("stores", "0002_store_default_locale_store_enabled_locales"),
    ]

    operations = [
        migrations.AddField(
            model_name="store",
            name="theme_preset",
            field=models.CharField(default="modern", max_length=50),
        ),
        migrations.AddField(
            model_name="store",
            name="theme_overrides",
            field=models.JSONField(default=dict),
        ),
    ]
