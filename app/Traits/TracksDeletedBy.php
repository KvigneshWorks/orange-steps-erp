<?php

namespace App\Traits;

use Illuminate\Support\Facades\Schema;

/**
 * Stamps deleted_by / deleted_by_name onto a model the moment it is
 * soft-deleted, mirroring the existing created_by / created_by_name
 * convention used across this project (see e.g. Category).
 *
 * Soft delete only ever UPDATEs the deleted_at (+ updated_at) columns
 * directly (see SoftDeletes::runSoftDelete()), so simply setting the
 * attributes on the model before delete() would NOT persist them. We
 * hook the `deleting` event instead and issue a small, explicit
 * UPDATE for just these two columns right before the soft-delete's
 * own UPDATE runs.
 *
 * Permanent (force) deletes are skipped — the row is being purged
 * entirely, so there is nothing to attribute.
 */
trait TracksDeletedBy
{
    public static function bootTracksDeletedBy(): void
    {
        static::deleting(function ($model) {
            if (method_exists($model, 'isForceDeleting') && $model->isForceDeleting()) {
                return;
            }

            $user = auth()->user();
            if (! $user) {
                return;
            }

            $table = $model->getTable();
            if (! Schema::hasColumn($table, 'deleted_by')) {
                return;
            }

            $model->newModelQuery()
                ->where($model->getKeyName(), $model->getKey())
                ->update([
                    'deleted_by'      => $user->id,
                    'deleted_by_name' => $user->name,
                ]);

            $model->setAttribute('deleted_by', $user->id);
            $model->setAttribute('deleted_by_name', $user->name);
        });
    }
}
